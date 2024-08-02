import { randomFillSync } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import nodePath from 'node:path';
import typeIs from '@browsery/type-is';
import { BadRequestError, HttpMediaType } from '@opra/common';
import busboy from 'busboy';
import { EventEmitter } from 'events';
import fsPromise from 'fs/promises';
import { StrictOmit } from 'ts-gems';
import { isNotNullish, ValidationError } from 'valgen';
import { HttpContext } from '../http-context';

export namespace MultipartReader {
  export interface Options extends StrictOmit<busboy.BusboyConfig, 'headers'> {
    tempDirectory?: string;
  }

  export interface FieldInfo {
    kind: 'field';
    field: string;
    value?: any;
    mimeType?: string;
    encoding?: string;
  }

  export interface FileInfo {
    kind: 'file';
    field: string;
    filename: string;
    storedPath: string;
    mimeType?: string;
    encoding?: string;
  }

  export type Item = FieldInfo | FileInfo;
}

export class MultipartReader extends EventEmitter {
  protected _started = false;
  protected _finished = false;
  protected _cancelled = false;
  protected _form: busboy.Busboy;
  protected _items: MultipartReader.Item[] = [];
  protected _stack: MultipartReader.Item[] = [];
  protected tempDirectory: string;

  constructor(
    protected context: HttpContext,
    options?: MultipartReader.Options,
    protected mediaType?: HttpMediaType,
  ) {
    super();
    this.setMaxListeners(1000);
    this.tempDirectory = options?.tempDirectory || os.tmpdir();

    const { request } = context;
    const form = busboy({ headers: request.headers });
    this._form = form;
    form.once('error', (e: any) => {
      this._cancelled = true;
      this._finished = true;
      if (this.listenerCount('error') > 0) this.emit('error', e);
    });
    form.on('close', () => {
      this._finished = true;
    });
    form.on('field', (field: string, value: string, info: busboy.Info) => {
      const item: MultipartReader.FieldInfo = {
        kind: 'field',
        field,
        value,
        mimeType: info.mimeType,
        encoding: info.encoding,
      };
      this._items.push(item);
      this._stack.push(item);
      this.emit('field', item);
      this.emit('item', item);
    });
    form.on('file', (field: string, file, info: busboy.FileInfo) => {
      const saveTo = nodePath.join(this.tempDirectory, `opra-${generateFileName()}`);
      file.pipe(fs.createWriteStream(saveTo));
      file.once('end', () => {
        const item: MultipartReader.FileInfo = {
          kind: 'file',
          field,
          storedPath: saveTo,
          filename: info.filename,
          mimeType: info.mimeType,
          encoding: info.encoding,
        };
        this._items.push(item);
        this._stack.push(item);
        this.emit('file', item);
        this.emit('item', item);
      });
    });
  }

  get items(): MultipartReader.Item[] {
    return this._items;
  }

  async getNext(): Promise<MultipartReader.Item | undefined> {
    let item = this._stack.shift();
    if (!item && !this._finished) {
      this.resume();
      item = await new Promise<any>((resolve, reject) => {
        let resolved = false;
        if (this._stack.length) return resolve(this._stack.shift());
        if ((this._form as any).ended) return resolve(undefined);
        this._form.once('close', () => {
          if (resolved) return;
          resolved = true;
          resolve(this._stack.shift());
        });
        this.once('item', () => {
          this.pause();
          if (resolved) return;
          resolved = true;
          resolve(this._stack.shift());
        });
        this.once('error', e => reject(e));
      });
    }
    if (item && this.mediaType) {
      const field = this.mediaType.findMultipartField(item.field);
      if (!field) throw new BadRequestError(`Unknown multipart field (${item.field})`);
      if (item.kind === 'field') {
        const decode = field.generateCodec('decode', { ignoreReadonlyFields: true, projection: '*' });
        item!.value = decode(item!.value, {
          onFail: issue => `Multipart field (${item.field}) validation failed: ` + issue.message,
        });
      } else if (item.kind === 'file') {
        if (field.contentType) {
          const arr = Array.isArray(field.contentType) ? field.contentType : [field.contentType];
          if (!(item.mimeType && arr.find(ct => typeIs.is(item.mimeType!, [ct])))) {
            throw new BadRequestError(`Multipart field (${item.field}) do not accept this content type`);
          }
        }
      }
    }

    /** if all items received we check for required items */
    if (this._finished && this.mediaType && this.mediaType.multipartFields?.length > 0) {
      const fieldsLeft = new Set(this.mediaType.multipartFields);
      for (const x of this._items) {
        const field = this.mediaType.findMultipartField(x.field);
        if (field) fieldsLeft.delete(field);
      }
      let issues: any[] | undefined;
      for (const field of fieldsLeft) {
        if (!field.required) continue;
        try {
          isNotNullish(null, { onFail: () => `Multi part field "${String(field.fieldName)}" is required` });
        } catch (e: any) {
          if (!issues) {
            issues = (e as ValidationError).issues;
            this.context.errors.push(e);
          } else issues.push(...(e as ValidationError).issues);
        }
      }
      if (this.context.errors.length) throw this.context.errors[0];
    }
    return item;
  }

  async getAll(): Promise<MultipartReader.Item[]> {
    const items: MultipartReader.Item[] = [...this._items];
    let item: MultipartReader.Item | undefined;
    while (!this._cancelled && (item = await this.getNext())) {
      items.push(item);
    }
    return items;
  }

  getAll_(): Promise<MultipartReader.Item[]> {
    if ((this._form as any).ended) return Promise.resolve([...this._items]);
    this.resume();
    return new Promise((resolve, reject) => {
      this._form.once('error', reject);
      this._form.once('end', () => {
        resolve([...this._items]);
      });
    });
  }

  cancel() {
    this._cancelled = true;
    if ((this._form as any).req) this.resume();
  }

  resume() {
    if (!this._started) {
      this._started = true;
      this.context.request.pipe(this._form);
    }
    this.context.request.resume();
  }

  pause() {
    this.context.request.pause();
  }

  async purge() {
    const promises: Promise<any>[] = [];
    this._items.forEach(item => {
      if (item.kind !== 'file') return;
      promises.push(fsPromise.unlink(item.storedPath));
    });
    return Promise.allSettled(promises);
  }
}

function generateFileName() {
  const buf = Buffer.alloc(10);
  return new Date().toISOString().substring(0, 10).replace(/-/g, '') + randomFillSync(buf).toString('hex');
}
