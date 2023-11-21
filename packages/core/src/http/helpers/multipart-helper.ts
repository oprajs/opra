import { EventEmitter } from 'events';
import formidable from 'formidable';
import type IncomingForm from 'formidable/Formidable.js';
import fs from 'fs/promises';
import { HttpIncomingMessage } from '../impl/http-incoming-message.host.js';

export type MultipartFile = formidable.File;
export type MultipartItem = {
  field: string;
  value?: string;
  file?: MultipartFile;
}

export class MultipartIterator extends EventEmitter {
  protected _cancelled = false;
  protected _form: IncomingForm;
  protected _items: MultipartItem[] = [];
  protected _stack: MultipartItem[] = [];

  protected constructor(options?: formidable.Options) {
    super();
    this.setMaxListeners(1000);
    const form = this._form = formidable({
      ...options,
      filter: (part: formidable.Part) => {
        return !this._cancelled && (!options?.filter || options.filter(part));
      }
    });
    form.once('error', () => {
      this._cancelled = true;
      if (this.listenerCount('error') > 0)
        this.emit('error');
    });
    form.on('field', (field: string, value: string) => {
      const item: MultipartItem = {field, value};
      this._items.push(item);
      this._stack.push(item);
      this.emit('item', item);
    });
    form.on('file', (field: string, file: formidable.File) => {
      const item: MultipartItem = {field, file};
      this._items.push(item);
      this._stack.push(item);
      this.emit('item', item);
    });
  }

  get items(): MultipartItem[] {
    return this._items;
  }

  getNext(): Promise<MultipartItem | undefined> {
    if ((this._form as any).ended)
      return Promise.resolve(undefined);
    this.resume();
    return new Promise<any>((resolve, reject) => {
      if (this._stack.length)
        return resolve(this._stack.shift())
      this.once('item', () => resolve(this._stack.shift()));
      this.once('error', (e) => reject(e));
    })
  }

  getAll(): Promise<MultipartItem[]> {
    if ((this._form as any).ended)
      return Promise.resolve([...this._items]);
    this.resume();
    return new Promise((resolve, reject) => {
      this._form.once('error', reject);
      this._form.once('end', () => {
        resolve([...this._items]);
      })
    })
  }

  cancel() {
    this._cancelled = true;
    if ((this._form as any).req)
      this.resume();
  }

  resume() {
    if ((this._form as any).req)
      (this._form as any).resume();
  }

  pause() {
    if ((this._form as any).req)
      (this._form as any).pause();
  }

  async deleteFiles() {
    const promises: Promise<any>[] = [];
    this._items
        .forEach(item => {
          if (!item.file)
            return;
          const file: any = item.file;
          promises.push(new Promise<void>(resolve => {
                if (file._writeStream.closed)
                  return resolve();
                file._writeStream.once('close', resolve);
              }).then(() => {
                return fs.unlink(file.filepath);
              }).then(() => {
                return 0;
              })
          )
        });
    return Promise.allSettled(promises);
  }

  static async create(incoming: HttpIncomingMessage, options?: formidable.Options): Promise<MultipartIterator> {
    const out = new MultipartIterator(options);
    await out._form.parse(incoming as any);
    return out;
  }
}
