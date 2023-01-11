import { ResponsiveMap } from '../helpers/responsive-map.js';
import { HttpHeaderCodes } from './enums/http-headers-codes.enum.js';

const knownKeys = Object.keys(HttpHeaderCodes);
const knownKeysLower = knownKeys.map(x => x.toLowerCase());

export class HttpHeaders {
  private _map = new ResponsiveMap<string, string[]>();

  constructor(headers?: string | Headers | HttpHeaders | Record<string, string | string[]>) {
    if (headers) {
      if (typeof headers === 'string') {
        headers.split('\n').forEach(line => {
          const index = line.indexOf(':');
          if (index > 0) {
            const name = line.slice(0, index);
            const value = line.slice(index + 1).trim();
            this.append(name, value);
          }
        });
      } else if (headers.forEach && typeof headers.forEach === 'function')
        headers.forEach((value, name) => this.append(name, value))
      else
        Object.keys(headers).forEach(name => this.append(name, headers[name]));
    }
  }

  /**
   * Appends a new value to the existing set of values for a header
   * and returns this instance
   */
  append(name: string, value: string | string[]): this {
    const i = knownKeysLower.indexOf(name);
    const normalizedName = knownKeys[i] || name;
    let values = this._map.get(normalizedName);
    if (!values) {
      values = [];
      this._map.set(normalizedName, values);
    }
    if (Array.isArray(value))
      values.push(...value);
    else values.push(value);
    return this;
  }

  /**
   * Deletes values for a given header
   */
  delete(name: string, value?: string | string[]): this {
    if (value) {
      const values = this._map.get(name);
      if (!values)
        return this;
      const valueToDelete = Array.isArray(value) ? value : [value];
      const newValues = values.filter(x => !valueToDelete.includes(x));
      this._map.set(name, newValues);
    } else
      this._map.delete(name);
    return this;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[string, string]> {
    const iter = this._map.entries();
    let i = -1;
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
            i = -1;
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
          value: [key, values[++i]]
        }
      }
    };
  }

  /**
   * Retrieves value of a given header at given index
   */
  get(name: string, index = 0): string | null {
    const values = this._map.get(name.toLowerCase());
    return values && values.length > index ? values[index] : null;
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
   * Retrieves an array of values for a given header.
   */
  getAll(name: string): string[] | null {
    return this._map.get(name) || null;
  }

  /**
   * Retrieves the names of the headers.
   */
  keys(): IterableIterator<string> {
    return this._map.keys();
  }

  /**
   * Checks for existence of a given header.
   */
  has(name: string): boolean {
    return this._map.has(name);
  }

  /**
   * Sets or modifies a value for a given header.
   * If the header already exists, its value is replaced with the given value
   */
  set(name: string, value: string | string[]): this {
    const i = knownKeysLower.indexOf(name);
    const normalizedName = knownKeys[i] || name;
    this._map.set(normalizedName, Array.isArray(value) ? value : [value]);
    return this;
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    this._map.sort(compareFn);
    return this;
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }

}
