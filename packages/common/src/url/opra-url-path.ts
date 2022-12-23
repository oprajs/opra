import { EventEmitter } from 'events';
import { tokenize } from 'fast-tokenizer';
import { isURL } from '../utils/index.js';
import { OpraURLPathComponent, OpraURLPathComponentInit } from './opra-url-path-component.js';
import { decodePathComponent, encodePathComponent, normalizePath } from './utils/path-utils.js';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

export class OpraURLPath extends EventEmitter {
  private _entries: OpraURLPathComponent[] = [];

  constructor(...components: (OpraURLPathComponent | OpraURLPathComponentInit)[])
  constructor(init?: string | OpraURLPath | URL | OpraURLPathComponent | OpraURLPathComponentInit)
  constructor(...args: any) {
    super();
    for (const x of args) {
      if (isURL(x)) {
        this._parse(x.pathname);
        continue;
      }
      // noinspection SuspiciousTypeOfGuard
      if (x instanceof OpraURLPath)
        this._entries.push(...x._entries);
      else this.add(x);
    }
  }

  get size(): number {
    return this._entries.length;
  }

  add(component: OpraURLPathComponent | { resource: string; key?: any, typeCast?: string }): void
  add(name: string, key?: any, typeCast?: string): void
  add(component: any, key?: any, typeCast?: string): void {
    this._add(component, key, typeCast);
    this.emit('change');
  }

  clear(): void {
    this._entries = [];
    this.emit('change');
  }

  get(index: number): OpraURLPathComponent {
    return this._entries[index];
  }

  join(pathString: string): this {
    const pathTokenizer = tokenize(normalizePath(pathString, true), {
      delimiters: '/', quotes: true, brackets: true,
    });
    for (const x of pathTokenizer) {
      const p = decodePathComponent(x);
      this._add(p);
    }
    this.emit('change');
    return this;
  }

  entries(): IterableIterator<[OpraURLPathComponent, number]> {
    let i = -1;
    const arr = [...this._entries];
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: [arr[i], i]
        }
      }
    };
  }

  values(): IterableIterator<OpraURLPathComponent> {
    let i = -1;
    const arr = [...this._entries];
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: arr[i]
        }
      }
    };
  }

  forEach(callback: (name: string, key: any, _this: this) => void) {
    for (const item of this._entries) {
      callback.call(this, item.resource, item.key, this);
    }
  }

  getResource(index: number): string | undefined {
    const v = this._entries[index];
    return v == null ? undefined : v.resource;
  }

  getKey(index: number): any {
    const v = this._entries[index];
    return v == null ? undefined : v.key;
  }

  toString(): string {
    return this._entries.map(x => encodePathComponent(x.resource, x.key, x.typeCast)).join('/');
  }

  [Symbol.iterator](): IterableIterator<[OpraURLPathComponent, number]> {
    return this.entries();
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return this._entries;
  }

  protected _add(component: any, key?: any, typeCast?: string): void {
    if (component instanceof OpraURLPathComponent) {
      this._entries.push(component);
    } else if (typeof component === 'object')
      this._entries.push(new OpraURLPathComponent(component));
    else
      this._entries.push(new OpraURLPathComponent({resource: component, key, typeCast}));
  }

  protected _parse(v: string) {
    if (!v)
      return;
    const pathTokenizer = tokenize(v, {delimiters: '/', quotes: true, brackets: true});
    for (const x of pathTokenizer) {
      if (!x)
        continue;
      const p = decodePathComponent(x);
      this._add(p);
    }
    this.emit('change');
  }

}
