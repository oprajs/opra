import { ResponsiveMap } from '../helpers/responsive-map.js';
import { HttpHeaderCodes } from './enums/http-headers-codes.enum.js';

const knownKeys = Object.keys(HttpHeaderCodes);
const knownKeysLower = knownKeys.map(x => x.toLowerCase());

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const kEntries = Symbol('kEntries');
const kSize = Symbol('kSize');
const kOptions = Symbol('kOptions');

type HeaderValueType = string | number | boolean;
export type HttpHeadersInit = string | Headers | HttpHeaders | Map<string, any> | Record<string, string | string[]>;

export interface HttpHeadersOptions {
  onChange?: () => void;
}

export class HttpHeaders {
  protected static kEntries = kEntries;
  protected static kSize = kSize;
  protected static kOptions = kOptions;

  protected [kEntries] = new ResponsiveMap<string, string[]>();
  protected [kSize] = 0;
  protected [kOptions]: HttpHeadersOptions;

  constructor(init?: HttpHeadersInit, options?: HttpHeadersOptions) {
    this[kOptions] = {...options, onChange: undefined};
    if (init)
      this.appendAll(init);
    this[kOptions].onChange = options?.onChange;
  }

  get size(): number {
    return this[kSize];
  }

  /**
   * Appends a new value to the existing set of values for a header
   * and returns this instance
   */
  append(name: string, value: HeaderValueType | HeaderValueType[]): this {
    this._append(name, value);
    this.changed();
    return this;
  }

  /**
   * Appends multiple values to the existing set of values for a header
   * and returns this instance
   */
  appendAll(headers: HttpHeadersInit): this {
    if (typeof headers === 'string') {
      headers.split('\n').forEach(line => {
        const index = line.indexOf(':');
        if (index > 0) {
          const name = line.slice(0, index);
          const value = line.slice(index + 1).trim();
          this._append(name, value);
        }
      });
    } else if (headers.forEach && typeof headers.forEach === 'function')
      headers.forEach((value, name) => this._append(name, value))
    else
      Object.keys(headers).forEach(name => this._append(name, headers[name]));
    this.changed();
    return this;
  }

  changed(): void {
    if (this[kOptions].onChange)
      this[kOptions].onChange();
  }

  clear(): void {
    if (this[kEntries].size) {
      this[kEntries].clear();
      this[kSize] = 0;
      this.changed();
    }
  }

  /**
   * Deletes values for a given header
   */
  delete(name: string, value?: HeaderValueType | HeaderValueType[]): this {
    if (this._delete(name, value))
      this.changed();
    return this;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[string, string]> {
    const iter = this[kEntries].entries();
    let i = 0;
    let key: string;
    let values: string[] | undefined;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (values) {
          if (i >= values.length) {
            values = undefined;
            i = 0;
          }
        }
        if (!values) {
          const n = iter.next();
          if (n.done)
            return {done: true, value: undefined};
          key = n.value[0];
          values = n.value[1];
        }

        return {
          done: false,
          value: [key, values[i++]]
        }
      }
    };
  }

  forEach(callbackFn: (value: string, key: string, parent: HttpHeaders) => void, thisArg?: any): void {
    const iterator = this.entries();
    let entry = iterator.next();
    while (!entry.done) {
      callbackFn.call(thisArg || this, entry.value[1], entry.value[0], this);
      entry = iterator.next();
    }
  }

  /**
   * Retrieves value of a given header at given index
   */
  get(name: string, index = 0): string | null {
    const values = this[kEntries].get(name.toLowerCase());
    return values && values.length > index ? values[index] : null;
  }

  /**
   * Retrieves an array of values for a given header.
   */
  getAll(name: string): string[] | null {
    const entry = this[kEntries].get(name);
    return entry ? entry.slice(0) : null;
  }

  /**
   * Retrieves the names of the headers.
   */
  keys(): IterableIterator<string> {
    return this[kEntries].keys();
  }

  /**
   * Checks for existence of a given header.
   */
  has(name: string): boolean {
    return this[kEntries].has(name);
  }

  /**
   * Sets or modifies a value for a given header.
   * If the header already exists, its value is replaced with the given value
   */
  set(name: string, value: HeaderValueType | HeaderValueType[]): this {
    this._set(name, String(value));
    this.changed();
    return this;
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    this[kEntries].sort(compareFn);
    this.changed();
    return this;
  }

  protected _append(name: string, value: HeaderValueType | HeaderValueType[]) {
    const i = knownKeysLower.indexOf(name);
    const normalizedName = knownKeys[i] || name;
    let values = this[kEntries].get(normalizedName);
    if (!values) {
      values = [];
      this[kEntries].set(normalizedName, values);
    }
    const oldSize = values.length;
    if (Array.isArray(value))
      values.push(...value.map(x => String(x)));
    else values.push(String(value));
    this[kSize] = -oldSize + values.length;
  }

  protected _delete(name: string, value?: HeaderValueType | HeaderValueType[]): boolean {
    const oldValues = this[kEntries].get(name);
    if (!oldValues)
      return false;
    const oldSize = this[kSize];
    if (value) {
      const valueToDelete = Array.isArray(value) ? value.map(x => String(x)) : [String(value)];
      const newValues = oldValues.filter(x => !valueToDelete.includes(x));
      this[kEntries].set(name, newValues);
      this[kSize] += -oldValues.length + newValues.length;
    } else {
      this[kEntries].delete(name);
      this[kSize] -= oldValues.length;
    }
    return oldSize !== this[kSize];
  }

  protected _set(name: string, value: string | string[]): void {
    if (value == null) {
      this._delete(name);
      return;
    }
    const oldValues = this[kEntries].get(name);
    const i = knownKeysLower.indexOf(name);
    const normalizedName = knownKeys[i] || name;
    const newValues = Array.isArray(value) ? value : [value];
    this[kEntries].set(normalizedName, newValues);
    this[kSize] += -(oldValues?.length || 0) + newValues.length;
  }

  [nodeInspectCustom]() {
    return this[kEntries];
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'HttpHeaders';
  }

}
