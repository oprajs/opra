import { EventEmitter } from 'events';
import formidable from 'formidable';
import type IncomingForm from 'formidable/Formidable.js';
import fs from 'fs/promises';
import type { NodeIncomingMessage } from '../interfaces/node-incoming-message.interface.js';

export type MultipartFile = formidable.File;
export type MultipartItem = {
  fieldName: string;
  type: 'field' | 'file';
  value?: string;
  file?: MultipartFile;
};

export class MultipartReader extends EventEmitter {
  protected _incoming: NodeIncomingMessage;
  protected _started = false;
  protected _cancelled = false;
  protected _form: IncomingForm;
  protected _items: MultipartItem[] = [];
  protected _stack: MultipartItem[] = [];

  constructor(incoming: NodeIncomingMessage, options?: formidable.Options) {
    super();
    this.setMaxListeners(1000);
    this._incoming = incoming;
    const form = (this._form = formidable({
      ...options,
      filter: (part: formidable.Part) => {
        return !this._cancelled && (!options?.filter || options.filter(part));
      },
    }));
    form.once('error', () => {
      this._cancelled = true;
      if (this.listenerCount('error') > 0) this.emit('error');
    });
    form.on('field', (fieldName: string, value: string) => {
      const item: MultipartItem = { fieldName, type: 'field', value };
      this._items.push(item);
      this._stack.push(item);
      this.emit('field', item);
      this.emit('item', item);
    });
    form.on('file', (fieldName: string, file: formidable.File) => {
      const item: MultipartItem = { fieldName, type: 'file', file };
      this._items.push(item);
      this._stack.push(item);
      this.emit('file', item);
      this.emit('item', item);
    });
  }

  get items(): MultipartItem[] {
    return this._items;
  }

  getNext(): Promise<MultipartItem | undefined> {
    if (!(this._form as any).ended) this.resume();
    return new Promise<any>((resolve, reject) => {
      if (this._stack.length) return resolve(this._stack.shift());
      if ((this._form as any).ended) return resolve(undefined);
      this.once('item', () => resolve(this._stack.shift()));
      this.once('error', e => reject(e));
    });
  }

  getAll(): Promise<MultipartItem[]> {
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
    if (!this._started) this._form.parse(this._incoming as any, () => void 0);
    if ((this._form as any).req) (this._form as any).resume();
  }

  pause() {
    if ((this._form as any).req) (this._form as any).pause();
  }

  async deleteTempFiles() {
    const promises: Promise<any>[] = [];
    this._items.forEach(item => {
      if (!item.file) return;
      const file: any = item.file;
      promises.push(
        new Promise<void>(resolve => {
          if (file._writeStream.closed) return resolve();
          file._writeStream.once('close', resolve);
        })
          .then(() => {
            return fs.unlink(file.filepath);
          })
          .then(() => {
            return 0;
          }),
      );
    });
    return Promise.allSettled(promises);
  }
}
