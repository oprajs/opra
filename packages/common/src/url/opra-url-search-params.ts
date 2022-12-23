import { EventEmitter } from 'events';
import { splitString, tokenize } from 'fast-tokenizer';
import { StrictOmit } from 'ts-gems';
import { URLSearchParams } from 'url';
import { ResponsiveMap } from '../helpers/index.js';
import { BooleanFormat } from './formats/boolean-format.js';
import { DateFormat } from './formats/date-format.js';
import { FilterFormat } from './formats/filter-format.js';
import { Format } from './formats/format.js';
import { IntegerFormat } from './formats/integer-format.js';
import { NumberFormat } from './formats/number-format.js';
import { StringFormat } from './formats/string-format.js';

const internalFormats = {
  'integer': new IntegerFormat(),
  'number': new NumberFormat(),
  'string': new StringFormat(),
  'boolean': new BooleanFormat(),
  'date': new DateFormat(),
  'filter': new FilterFormat()
}

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

interface OpraURLSearchParamItem {
  name: string;
  format?: Format | string;
  array?: boolean | 'strict';
  arrayDelimiter?: string;
  minArrayItems?: number;
  maxArrayItems?: number;
}

export class OpraURLSearchParams extends EventEmitter {
  protected _params = new ResponsiveMap<string, OpraURLSearchParamItem>();
  private _entries = new ResponsiveMap<string, any[]>();
  private _size = 0;

  constructor(init?: (string | URLSearchParams | OpraURLSearchParams)) {
    super();
    this.defineParam('$filter', {format: 'filter'});
    this.defineParam('$limit', {format: new IntegerFormat({min: 0})});
    this.defineParam('$skip', {format: new IntegerFormat({min: 0})});
    this.defineParam('$pick', {format: 'string', array: 'strict'});
    this.defineParam('$omit', {format: 'string', array: 'strict'});
    this.defineParam('$include', {format: 'string', array: 'strict'});
    this.defineParam('$sort', {format: 'string', array: 'strict'});
    this.defineParam('$distinct', {format: 'boolean'});
    this.defineParam('$count', {format: 'boolean'});
    if (init) {
      if (typeof init === 'string')
        this.parse(init)
      else
        this.addAll(init);
    }
  }

  get size(): number {
    return this._size;
  }

  addAll(values: URLSearchParams | OpraURLSearchParams | Map<string, any> | Record<string, any>) {
    let changed = false;
    if (typeof values.forEach === 'function') {
      values.forEach((value: any, name: string) => {
        changed = this._add(name, value) || changed;
      });
    } else if (typeof values === 'object') {
      Object.entries((name, value) => {
        changed = this._add(name, value) || changed;
      })
    } else
      throw new TypeError(`Invalid argument`);
    if (changed)
      this.emit('change');
  }

  append(name: string, value?: any): void {
    if (this._add(name, value))
      this.emit('change');
  }

  clear(): void {
    this._entries.clear();
    this._size = 0;
    this.emit('change');
  }

  defineParam(name: string, options?: StrictOmit<OpraURLSearchParamItem, 'name'>): this {
    if (!name)
      throw new Error('Parameter name required');
    const meta: OpraURLSearchParamItem = {
      ...options,
      name,
      format: options?.format || 'string'
    }
    if (typeof meta.format === 'string' && !internalFormats[meta.format])
      throw new Error(`Unknown data format "${meta.format}"`);
    meta.format = meta.format || 'string';
    this._params.set(name, meta);
    return this;
  }

  delete(name: string): void {
    if (this._delete(name))
      this.emit('change');
  }

  entries(): IterableIterator<[string, any]> {
    const items: [string, any][] = [];
    this.forEach((value: string, name: string) => {
      items.push([name, value]);
    });
    return items.values();
  }

  forEach(callback: (value: any, name: string, _this: this) => void) {
    for (const [name, entry] of this._entries.entries()) {
      for (let i = 0; i < entry.length; i++) {
        callback(entry[i], name, this);
      }
    }
  }

  get(name: string, index?: number): any | null {
    const entry = this._entries.get(name);
    const v = entry && entry[index || 0];
    return v == null ? null : v;
  }

  getAll(name: string): any[] {
    const entry = this._entries.get(name);
    return entry ? entry.slice(0) : [];
  }

  has(name: string): boolean {
    return this._entries.has(name);
  }

  keys(): IterableIterator<string> {
    return this._entries.keys();
  }

  set(name: string, value?: any): void {
    this._delete(name);
    this._add(name, value);
    this.emit('change');
  }

  sort(compareFn?: (a: string, b: string) => number): void {
    this._entries.sort(compareFn);
    this.emit('change');
  }

  values(): IterableIterator<any> {
    const items: string[] = [];
    this.forEach((value: string) => items.push(value));
    return items.values();
  }

  toString(): string {
    let out: string = '';
    this.forEach((v, k) => {
      const qi = this._params.get(k);
      const format = qi
          ? (typeof qi.format === 'string' ? internalFormats[qi.format] : qi.format)
          : undefined;
      const stringify = (x) => encodeURIComponent(format ? format.stringify(x, k) : (x == null ? '' : '' + x));
      const val = Array.isArray(v)
          ? v.map(stringify).join(qi?.arrayDelimiter || ',')
          : stringify(v);
      if (val) {
        if (out.length > 0) out += '&';
        out += k + '=' + val;
      }
    });
    return out;
  }

  parse(input: string): void {
    this._entries.clear();
    this._size = 0;
    if (input && input.startsWith('?'))
      input = input.substring(1);
    if (!input)
      return;
    const tokenizer = tokenize(input, {delimiters: '&', quotes: true, brackets: true});
    for (const token of tokenizer) {
      if (!token)
        continue;
      const itemTokenizer = tokenize(token, {
        delimiters: '=',
        quotes: true,
        brackets: true,
      });
      const k = decodeURIComponent(itemTokenizer.next() || '');
      const v = itemTokenizer.join('=');
      const qi = this._params.get(k);
      if (qi?.array) {
        const values = splitString(v, {
          delimiters: qi?.arrayDelimiter || ',',
          brackets: true,
          quotes: true
        }).map((x) => decodeURIComponent(x));
        this._add(k, values);
      } else {
        this._add(k, decodeURIComponent(v));
      }
    }
    this.emit('change');
  }

  toURLSearchParams(): URLSearchParams {
    const out = new URLSearchParams();
    this.forEach((v, k) => {
      const qi = this._params.get(k);
      const format = qi
          ? (typeof qi.format === 'string' ? internalFormats[qi.format] : qi.format)
          : undefined;
      const stringify = (x) => format ? format.stringify(x, k) : (x == null ? '' : '' + x);
      const val = Array.isArray(v)
          ? v.map(stringify).join(qi?.arrayDelimiter || ',')
          : stringify(v);
      out.append(k, val);
    });
    return out;
  }

  [Symbol.iterator](): IterableIterator<[string, any]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return 'URLSearchParams';
  }

  [nodeInspectCustom]() {
    return this._entries;
  }

  protected _delete(name: string): boolean {
    const a = this._entries.get(name);
    if (!a)
      return false;
    this._size -= a.length;
    this._entries.delete(name);
    return true;
  }

  protected _add(name: string, value: any): boolean {
    const qi = this._params.get(name);
    const format = qi ?
        (typeof qi.format === 'string' ? internalFormats[qi.format] : qi.format) : undefined;
    const fn = (x) => format ? format.parse(x, name) : x;
    let v = Array.isArray(value) ? value.map(fn) : fn(value);

    if (qi) {
      if (qi.array === 'strict')
        v = Array.isArray(v) ? v : [v];
      else if (qi.array)
        v = Array.isArray(v) && v.length === 1 ? v[0] : v;
      if (Array.isArray(v)) {
        if (qi.minArrayItems && v.length < qi.minArrayItems)
          throw new Error(`"${name}" parameter requires at least ${qi.minArrayItems} values`);
        if (qi.maxArrayItems && v.length > qi.maxArrayItems)
          throw new Error(`"${name}" parameter accepts up to ${qi.maxArrayItems} values`);
      }
    }

    let entry = this._entries.get(name);
    if (!entry) {
      entry = [];
      this._entries.set(name, entry);
    }
    entry.push(v);
    this._size++;
    return true;
  }

}
