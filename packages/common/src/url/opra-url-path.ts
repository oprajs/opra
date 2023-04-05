import { tokenize } from 'fast-tokenizer';
import { isURL } from '../helpers/index.js';
import type { OpraURL } from './opra-url.js';
import { OpraURLPathComponent, OpraURLPathComponentInit } from './opra-url-path-component.js';
import { decodePathComponent, encodePathComponent, normalizePath } from './utils/path-utils.js';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const kEntries = Symbol('kEntries');
const kOptions = Symbol('kOptions');

export interface OpraURLPathOptions {
  onChange?: () => void;
}

export class OpraURLPath {
  protected static kEntries = kEntries;
  protected static kOptions = kOptions;

  protected [kEntries]: OpraURLPathComponent[] = [];
  protected [kOptions]: OpraURLPathOptions;

  constructor(
      init?: string | OpraURLPath | URL | OpraURLPathComponentInit | OpraURLPathComponentInit[],
      options?: OpraURLPathOptions
  ) {
    this[kOptions] = {...options, onChange: undefined};
    if (Array.isArray(init))
      this.join(...init);
    else if (init)
      this.join(init);
    this[kOptions].onChange = options?.onChange;
  }

  get size(): number {
    return this[kEntries].length;
  }

  changed(): void {
    if (this[kOptions].onChange)
      this[kOptions].onChange();
  }

  clear(): void {
    this[kEntries] = [];
    this.changed();
  }

  get(index: number): OpraURLPathComponent {
    return this[kEntries][index];
  }

  join(...source: (string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit)[]): this {
    source.forEach(x => this._join(this[kEntries], x));
    this.changed();
    return this;
  }

  entries(): IterableIterator<[OpraURLPathComponent, number]> {
    let i = -1;
    const arr = [...this[kEntries]];
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

  forEach(callback: (component: OpraURLPathComponent, _this: this) => void) {
    for (const item of this[kEntries]) {
      callback.call(this, item, this);
    }
  }

  getResource(index: number): string | undefined {
    const v = this[kEntries][index];
    return v == null ? undefined : v.resource;
  }

  getKey(index: number): any {
    const v = this[kEntries][index];
    return v == null ? undefined : v.key;
  }

  pop(): OpraURLPathComponent | undefined {
    const out = this[kEntries].pop();
    this.changed();
    return out;
  }

  shift(): OpraURLPathComponent | undefined {
    const out = this[kEntries].shift();
    this.changed();
    return out;
  }

  slice(start: number, end?: number): OpraURLPath {
    return new OpraURLPath(this[kEntries].slice(start, end));
  }

  splice(start: number, deleteCount: number,
         join?: string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit | OpraURLPathComponentInit[]
  ): void {
    const items = (join ? this._join([], join) : []) as OpraURLPathComponent[];
    this[kEntries].splice(start, deleteCount, ...items);
    this.changed();
  }

  unshift(join: string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit | OpraURLPathComponentInit[]
  ): void {
    return this.splice(0, 0, join);
  }

  toString(): string {
    return this[kEntries].map(x => encodePathComponent(x.resource, x.key, x.typeCast)).join('/');
  }

  values(): IterableIterator<OpraURLPathComponent> {
    let i = -1;
    const arr = [...this[kEntries]];
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

  protected _join(
      target: OpraURLPathComponent[],
      source: string | OpraURLPath | URL | OpraURL | OpraURLPathComponentInit | OpraURLPathComponentInit[]
  ) {
    if (typeof source === 'string') {
      const pathTokenizer = tokenize(normalizePath(source, true), {
        delimiters: '/', quotes: true, brackets: true,
      });
      for (const x of pathTokenizer) {
        const p = decodePathComponent(x);
        target.push(new OpraURLPathComponent(p));
      }
      return;
    }
    if (source instanceof OpraURLPath) {
      target.push(...source[kEntries].map(x => new OpraURLPathComponent(x)));
      return;
    }
    if (typeof source === 'object' && (source as any).path instanceof OpraURLPath) {
      this._join(target, (source as any).path);
      return;
    }
    if (isURL(source)) {
      this._join(target, source.pathname);
      return;
    }
    if (Array.isArray(source)) {
      source.forEach(x => this._join(target, x));
      return;
    }
    target.push(new OpraURLPathComponent(source as OpraURLPathComponentInit));
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return this[kEntries];
  }

  [Symbol.iterator](): IterableIterator<[OpraURLPathComponent, number]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'OpraURLPath';
  }

}
