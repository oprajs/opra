import { splitString, tokenize } from 'fast-tokenizer';
import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../helpers/responsive-map.js';
import { HttpParamCodec } from './http-param-codec.js';
import { BooleanCodec } from './param-codec/boolean-codec.js';
import { DateCodec } from './param-codec/date-codec.js';
import { FilterCodec } from './param-codec/filter-codec.js';
import { IntegerCodec } from './param-codec/integer-codec.js';
import { NumberCodec } from './param-codec/number-codec.js';
import { StringCodec } from './param-codec/string-codec.js';
import { encodeURIParam } from './utils/encodeURIParam.js';

const kEntries = Symbol('kEntries');
const kSize = Symbol('kSize');
const kParamDefs = Symbol('kParamDefs');
const kOptions = Symbol('kOptions');

export type HttpParamsInit = string | URLSearchParams | HttpParams | Map<string, any> | Record<string, any>;
const defaultKeyDecoder = (s: string) => decodeURIComponent(s);
const defaultValueDecoder = (s: string) => decodeURIComponent(s);
const defaultKeyEncoder = (s: string) => encodeURIParam(s);
const defaultValueEncoder = (s: string) => encodeURIParam(s);

const internalCodecs = {
  'boolean': new BooleanCodec(),
  'date': new DateCodec(),
  'filter': new FilterCodec(),
  'integer': new IntegerCodec(),
  'number': new NumberCodec(),
  'string': new StringCodec()
}

export interface HttpParamsCodec {
  encodeKey?: (key: string) => string;
  decodeKey?: (key: string) => string;
  encodeValue?: (value: any) => string;
  decodeValue?: (value: string) => any;
}

interface HttpParamMeta {
  codec: HttpParamCodec;
  array?: boolean | 'strict';
  arrayDelimiter?: string;
  minArrayItems?: number;
  maxArrayItems?: number;
}

export type HttpParamDefinition = StrictOmit<HttpParamMeta, 'codec'> & {
  codec?: HttpParamCodec | string;
}

export interface HttpParamsOptions extends HttpParamsCodec {
  onChange?: () => void;
  params?: Record<string, HttpParamDefinition>;
}

export class HttpParams {
  protected static kEntries = kEntries;
  protected static kSize = kSize;
  protected static kParamDefs = kParamDefs;
  protected static kOptions = kOptions;

  protected [kEntries] = new ResponsiveMap<string, any[]>();
  protected [kSize] = 0;
  protected [kOptions]: HttpParamsOptions;
  protected [kParamDefs] = new Map<string, HttpParamMeta>();

  constructor(init?: HttpParamsInit, options?: HttpParamsOptions) {
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
  append(name: string, value?: any): this {
    this._append(name, value);
    this.changed();
    return this;
  }

  appendAll(input: HttpParamsInit): this {
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
        const k = this.decodeKey(itemTokenizer.next() || '');
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
  delete(name: string, value?: any): this {
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

  forEach(callbackFn: (value: string, key: string, parent: HttpParams) => void, thisArg?: any): void {
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
  get(name: string, index = 0): any {
    const values = this[kEntries].get(name.toLowerCase());
    return values && values.length > index ? values[index] : null;
  }

  /**
   * Retrieves an array of values for a given parameter.
   */
  getAll(name: string): any[] | null {
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
  values(): IterableIterator<any> {
    const items: string[] = [];
    this.forEach((value: string) => items.push(value));
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
  set(name: string, value: any): this {
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
      out.push(this.encodeKey(k) +
          (v ? '=' + this.encodeValue(v, k) : ''));
    });
    return out.join('&');
  }

  define(name: string, options?: HttpParamDefinition): this {
    if (!name)
      throw new Error('Parameter name required');
    if (typeof options?.codec === 'string' && !internalCodecs[options.codec])
      throw new Error(`Unknown url parameter format name "${options.codec}"`);
    const codec = (typeof options?.codec === 'string'
            ? internalCodecs[options.codec]
            : options?.codec
    ) || internalCodecs.string;

    const meta: HttpParamMeta = {
      ...options,
      codec
    }
    this[kParamDefs].set(name, meta);
    return this;
  }

  encodeKey(key: string): string {
    return (this[kOptions].encodeKey || defaultKeyEncoder)(key);
  }

  decodeKey(key: string): string {
    return (this[kOptions].decodeKey || defaultKeyDecoder)(key);
  }

  encodeValue(value: any, key: string): string {
    const prmDef = this[kParamDefs].get(key);
    if (prmDef) {
      const delimReplace = '%' + (prmDef.arrayDelimiter || ',').charCodeAt(0).toString(16).toUpperCase();
      const fn = (x) => encodeURIParam(prmDef.codec.encode(x)).replaceAll(',', delimReplace);
      return Array.isArray(value)
          ? value.map((v: string) => fn(v)).join(prmDef.arrayDelimiter || ',')
          : fn(value);
    }

    return (this[kOptions].encodeValue || defaultValueEncoder)(value);
  }

  decodeValue(value: string, key: string): any {
    const prmDef = this[kParamDefs].get(key);
    const valueDecoder = (this[kOptions].decodeValue || defaultValueDecoder);
    let val: any = value;
    if (prmDef) {
      if (prmDef.array) {
        val = splitString(value, {
          delimiters: prmDef.arrayDelimiter || ',',
          brackets: true,
          quotes: true,
          keepQuotes: false
        }).map((x) => valueDecoder(x));
      } else
        val = valueDecoder(val);
      const fn = (x) => prmDef.codec.decode(valueDecoder(x));
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
    return valueDecoder(value);
  }

  protected _append(name: string, value?: any) {
    let values = this[kEntries].get(name);
    if (!values) {
      values = [];
      this[kEntries].set(name, values);
    }
    values.push(value ?? null);
    this[kSize] += 1;
  }

  protected _delete(name: string, value?: string | string[]): boolean {
    const oldValues = this[kEntries].get(name);
    if (!oldValues)
      return false;
    const oldSize = this[kSize];
    if (value) {
      const valueToDelete = Array.isArray(value) ? value : [value];
      const newValues = oldValues.filter(x => !valueToDelete.includes(x));
      this[kEntries].set(name, newValues);
      this[kSize] += -oldValues.length + newValues.length;
    } else {
      this[kEntries].delete(name);
      this[kSize] -= oldValues.length;
    }
    return oldSize !== this[kSize];
  }

  protected _set(name: string, value: any, index?: number): void {
    if (value == null) {
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


  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'HttpParams';
  }

}
