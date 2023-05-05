import { splitString, tokenize } from 'fast-tokenizer';
import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../helpers/index.js';
import { BooleanCodec } from './codecs/boolean-codec.js';
import { DateCodec } from './codecs/date-codec.js';
import { FilterCodec } from './codecs/filter-codec.js';
import { IntegerCodec } from './codecs/integer-codec.js';
import { NumberCodec } from './codecs/number-codec.js';
import { StringCodec } from './codecs/string-codec.js';

export namespace HttpParams {
  export type Initiator = string | URLSearchParams | HttpParams |
      Map<string, HttpParams.Value> | Record<string, HttpParams.Value>;

  export type Value = string | number | boolean | object | null;

  export interface Options {
    onChange?: () => void;
    params?: Record<string, ParamDefinition>;
  }

  export type ParamDefinition = StrictOmit<HttpParamMetadata, 'codec'> & {
    codec?: Codec | string;
  }

  export interface Codec {
    decode(value: string): HttpParams.Value;

    encode(value: HttpParams.Value): string;
  }
}

interface HttpParamMetadata {
  codec: HttpParams.Codec;
  array?: boolean | 'strict';
  arrayDelimiter?: string;
  minArrayItems?: number;
  maxArrayItems?: number;
}

const kEntries = Symbol('kEntries');
const kSize = Symbol('kSize');
const kParamDefs = Symbol('kParamDefs');
const kOptions = Symbol('kOptions');

export class HttpParams {
  protected static kEntries = kEntries;
  protected static kSize = kSize;
  protected static kParamDefs = kParamDefs;
  protected static kOptions = kOptions;
  protected [kEntries] = new ResponsiveMap<(HttpParams.Value)[]>();
  protected [kSize] = 0;
  protected [kOptions]: HttpParams.Options;
  protected [kParamDefs] = new Map<string, HttpParamMetadata>();

  constructor(init?: HttpParams.Initiator, options?: HttpParams.Options) {
    this[kOptions] = {...options, onChange: undefined};
    const defineParams = options?.params;
    if (defineParams)
      Object.keys(defineParams).forEach(key => this.define(key, defineParams[key]));
    if (init)
      this.appendAll(init);
    this[kOptions].onChange = options?.onChange;
  }

  get size(): number {
    return this[kSize];
  }

  /**
   * Appends a new value to the existing set of values for a parameter
   * and returns this instance
   */
  append(name: string, value?: HttpParams.Value): this {
    this._append(name, value);
    this.changed();
    return this;
  }

  appendAll(input: HttpParams.Initiator): this {
    if (typeof input === 'string') {
      if (input && input.startsWith('?'))
        input = input.substring(1);
      if (!input)
        return this;
      const tokenizer = tokenize(input, {delimiters: '&', quotes: true, brackets: true});
      for (const token of tokenizer) {
        if (!token)
          continue;
        const itemTokenizer = tokenize(token, {
          delimiters: '=',
          quotes: true,
          brackets: true
        });
        const k = decodeURIComponent(itemTokenizer.next() || '');
        const v = this.decodeValue(itemTokenizer.join('='), k);
        this._append(k, v);
      }
    } else if (input.forEach && typeof input.forEach === 'function')
      input.forEach((value, name) => this._append(name, value))
    else
      Object.keys(input).forEach(name => this._append(name, input[name]));
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
   * Deletes values for a given parameter
   */
  delete(name: string, value?: HttpParams.Value): this {
    if (this._delete(name, value))
      this.changed();
    return this;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[string, HttpParams.Value]> {
    const iter = this[kEntries].entries();
    let i = 0;
    let key: string;
    let values: HttpParams.Value[] | undefined;
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

  forEach(callbackFn: (value: HttpParams.Value, key: string, parent: HttpParams) => void, thisArg?: any): void {
    const iterator = this.entries();
    let entry = iterator.next();
    while (!entry.done) {
      callbackFn.call(thisArg || this, entry.value[1], entry.value[0], this);
      entry = iterator.next();
    }
  }

  /**
   * Retrieves value of a given parameter at given index
   */
  get(name: string, index = 0): HttpParams.Value {
    const values = this[kEntries].get(name);
    return values && values.length > index ? values[index] : null;
  }

  /**
   * Retrieves an array of values for a given parameter.
   */
  getAll(name: string): HttpParams.Value[] | null {
    const entry = this[kEntries].get(name);
    return entry ? entry.slice(0) : null;
  }

  /**
   * Retrieves the names of the parameters.
   */
  keys(): IterableIterator<string> {
    return this[kEntries].keys();
  }

  /**
   * Retrieves the names of the parameters.
   */
  values(): IterableIterator<HttpParams.Value> {
    const items: HttpParams.Value[] = [];
    this.forEach((value: HttpParams.Value) => items.push(value));
    return items.values();
  }

  /**
   * Checks for existence of a parameter.
   */
  has(name: string): boolean {
    return this[kEntries].has(name);
  }

  /**
   * Sets or modifies a value for a given parameter.
   * If the header already exists, its value is replaced with the given value
   */
  set(name: string, value?: HttpParams.Value): this {
    this._set(name, value);
    this.changed();
    return this;
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    this[kEntries].sort(compareFn);
    this.changed();
    return this;
  }

  /**
   * Serializes the body to an encoded string, where key-value pairs (separated by `=`) are
   * separated by `&`s.
   */
  toString(): string {
    const out: string[] = [];
    this.forEach((v, k) => {
      out.push(encodeURIParam(k) +
          (v ? '=' + this.encodeValue(v, k) : ''));
    });
    return out.join('&');
  }

  getProxy(): Record<string, HttpParams.Value> {
    const _this = this;
    return this[kEntries].getProxy({
      get(target, p: string | symbol, receiver: any): HttpParams.Value {
        if (typeof p === 'string') {
          const v = _this[kEntries].get(p);
          return v ? (v.length > 1 ? v : v[0]) : null;
        }
        return Reflect.get(target, p, receiver);
      },
      set(target, p: string | symbol, newValue: HttpParams.Value, receiver: any): boolean {
        if (typeof p === 'string') {
          _this.set(p, newValue);
          return true;
        }
        return Reflect.set(target, p, newValue, receiver);
      },
    });
  }

  define(params: Record<string, HttpParams.ParamDefinition>): this
  define(name: string, options: HttpParams.ParamDefinition): this
  define(arg0, options?: HttpParams.ParamDefinition): this {
    if (typeof arg0 === 'object') {
      for (const [name, def] of Object.entries<HttpParams.ParamDefinition>(arg0))
        this.define(name, def);
      return this;
    }
    if (!arg0)
      throw new Error('"name" argument required');
    if (!options)
      throw new Error('"options" argument required');
    if (typeof options.codec === 'string' && !HttpParams.codecs[options.codec])
      throw new Error(`Unknown url parameter format name "${options.codec}"`);
    const codec = (typeof options?.codec === 'string'
            ? HttpParams.codecs[options.codec]
            : options?.codec
    ) || HttpParams.codecs.string;

    const meta: HttpParamMetadata = {
      ...options,
      codec
    }
    this[kParamDefs].set(arg0, meta);
    return this;
  }

  encodeValue(value: HttpParams.Value, key: string): string {
    const prmDef = this[kParamDefs].get(key);
    if (prmDef) {
      const delimReplace = '%' + (prmDef.arrayDelimiter || ',').charCodeAt(0).toString(16).toUpperCase();
      const fn = (x) => encodeURIParam(prmDef.codec.encode(x))
          .replace(/,/g, delimReplace);
      return Array.isArray(value)
          ? value.map((v: string) => fn(v)).join(prmDef.arrayDelimiter || ',')
          : fn(value);
    }
    return encodeURIParam(String(value));
  }

  decodeValue(value: string, key: string): HttpParams.Value {
    const prmDef = this[kParamDefs].get(key);
    let val: any = value;
    if (prmDef) {
      if (prmDef.array) {
        val = splitString(value, {
          delimiters: prmDef.arrayDelimiter || ',',
          brackets: true,
          quotes: true,
          keepQuotes: false
        }).map((x) => decodeURIComponent(x));
      } else
        val = decodeURIComponent(val);
      const fn = (x) => prmDef.codec.decode(decodeURIComponent(x));
      val = Array.isArray(val) ? val.map(fn) : fn(val);
      if (prmDef.array === 'strict')
        val = Array.isArray(val) ? val : [val];
      else if (prmDef.array)
        val = Array.isArray(val) && val.length === 1 ? val[0] : val;
      if (Array.isArray(val)) {
        if (prmDef.minArrayItems && val.length < prmDef.minArrayItems)
          throw new Error(`"${key}" parameter requires at least ${prmDef.minArrayItems} values`);
        if (prmDef.maxArrayItems && val.length > prmDef.maxArrayItems)
          throw new Error(`"${key}" parameter accepts up to ${prmDef.maxArrayItems} values`);
      }
      return val;
    }
    return decodeURIComponent(value);
  }

  [Symbol.iterator](): IterableIterator<[string, HttpParams.Value]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'HttpParams';
  }

  protected _append(name: string, value?: HttpParams.Value) {
    let values = this[kEntries].get(name);
    if (!values) {
      values = [];
      this[kEntries].set(name, values);
    }
    values.push(value ?? null);
    this[kSize] += 1;
  }

  protected _delete(name: string, value?: HttpParams.Value): boolean {
    const oldValues = this[kEntries].get(name);
    if (!oldValues)
      return false;
    const oldSize = this[kSize];
    if (value) {
      const newValues = oldValues.filter(x => x === value);
      this[kEntries].set(name, newValues);
      this[kSize] += -oldValues.length + newValues.length;
    } else {
      this[kEntries].delete(name);
      this[kSize] -= oldValues.length;
    }
    return oldSize !== this[kSize];
  }

  protected _set(name: string, value?: HttpParams.Value, index?: number): void {
    if (value === undefined) {
      this._delete(name);
      return;
    }
    const values = this[kEntries].get(name);
    if (!values) {
      this[kEntries].set(name, [value]);
      this[kSize] += 1;
      return;
    }
    if (index == null || index < 0) {
      this[kEntries].set(name, [value]);
      this[kSize] += -(values.length) + 1;
      return;
    }
    const oldLen = values.length;
    values[Math.min(index, values.length)] = value;
    this[kSize] += -oldLen + values.length;
  }


  static codecs = {
    'boolean': new BooleanCodec(),
    'date': new DateCodec(),
    'filter': new FilterCodec(),
    'integer': new IntegerCodec(),
    'number': new NumberCodec(),
    'string': new StringCodec()
  }

}


/**
 * Encode input string with standard encodeURIComponent and then un-encode specific characters.
 */
const ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const ENCODING_REPLACEMENTS: { [x: string]: string } = {
  '2C': ',',
  '2F': '/',
  '24': '$',
  '3A': ':',
  '3B': ';',
  '3D': '=',
  '3F': '?',
  '40': '@'
};


export function encodeURIParam(v: string): string {
  return encodeURIComponent(v).replace(
      ENCODING_REGEX, (s, t) => ENCODING_REPLACEMENTS[t] ?? s);
}
