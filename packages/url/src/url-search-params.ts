import { EventEmitter } from 'events';
import { splitString, tokenize } from 'fast-tokenizer';
import { StrictOmit } from 'ts-gems';
import { BooleanFormat } from './formats/boolean-format.js';
import { DateFormat } from './formats/date-format.js';
import { FilterFormat } from './formats/filter-format.js';
import { Format } from './formats/format.js';
import { IntegerFormat } from './formats/integer-format.js';
import { NumberFormat } from './formats/number-format.js';
import { StringFormat } from './formats/string-format.js';
import { nodeInspectCustom } from './types.js';
import { unquoteQueryString } from './utils/string-utils.js';
import { encodeQueryComponent } from './utils/url-utils.js';

const QUERYMETADATA_KEY = Symbol.for('opra.url.querymetadata');
const internalFormats = {
  'integer': new IntegerFormat(),
  'number': new NumberFormat(),
  'string': new StringFormat(),
  'boolean': new BooleanFormat(),
  'date': new DateFormat(),
  'filter': new FilterFormat()
}

export interface QueryItemMetadata {
  name: string;
  format?: Format | string;
  array?: boolean | 'strict';
  arrayDelimiter?: string;
  minArrayItems?: number;
  maxArrayItems?: number;
}

export class SearchParams extends EventEmitter {
  protected [QUERYMETADATA_KEY]: Record<string, QueryItemMetadata>;
  private _entries: Record<string, any[]> = {};
  private _size = 0;

  constructor(init?: (string | URLSearchParams | SearchParams)) {
    super();
    Object.defineProperty(this, QUERYMETADATA_KEY, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: {}
    });
    this._init(init);
  }

  get size(): number {
    return this._size;
  }

  defineParam(name: string, options?: StrictOmit<QueryItemMetadata, 'name'>): this {
    if (!name)
      throw new Error('Parameter name required');
    const meta: QueryItemMetadata = {
      ...options,
      name,
      format: options?.format || 'string'
    }
    if (typeof meta.format === 'string' && !internalFormats[meta.format])
      throw new Error(`Unknown data format "${meta.format}"`);
    const key = meta.name.toLowerCase();
    meta.format = meta.format || 'string';
    this[QUERYMETADATA_KEY][key] = meta;
    return this;
  }

  append(name: string, value?: any): void {
    this._add(name, value);
    this.emit('change');
  }

  clear(): void {
    this._entries = {};
    this._size = 0;
    this.emit('change');
  }

  delete(name: string): void {
    const a = this._entries[name];
    if (a) this._size -= a.length;
    delete this._entries[name];
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
    for (const name of Object.keys(this._entries)) {
      const items = this._entries[name];
      for (let i = 0; i < items.length; i++) {
        callback.call(this, items[i], name, this);
      }
    }
  }

  get(name: string, index?: number): any | null {
    const entry = this._entries[name];
    const v = entry && entry[index || 0];
    return v == null ? null : v;
  }

  getAll(name: string): any[] {
    return (name in this._entries)
        ? this._entries[name].slice(0)
        : [];
  }

  has(name: string): boolean {
    return (name in this._entries);
  }

  keys(): IterableIterator<string> {
    return Object.keys(this._entries).values();
  }

  set(name: string, value?: any): void {
    name = name.toLowerCase();
    const a = this._entries[name];
    if (a) this._size -= a.length;
    delete this._entries[name];
    this._add(name, value);
  }

  sort(compareFn?: (a: string, b: string) => number): void {
    const old = this._entries;
    this._entries = {};
    const keys = Object.keys(old).sort(compareFn);
    keys.forEach(k => this._entries[k] = old[k]);
    this.emit('change');
  }

  values(): IterableIterator<any> {
    const items: string[] = [];
    this.forEach((value: string) => items.push(value));
    return items.values();
  }

  parse(input: string): void {
    this.clear();
    if (input && input.startsWith('?'))
      input = input.substring(1);
    if (!input)
      return;
    const tokenizer = tokenize(input, {delimiters: '&', quotes: true, brackets: true});
    for (const token of tokenizer) {
      const itemTokenizer = tokenize(token, {
        delimiters: '=',
        quotes: true,
        brackets: true,
      });
      const k = decodeURIComponent(itemTokenizer.next() || '');
      const v = itemTokenizer.join('=');
      const meta = this[QUERYMETADATA_KEY][k];
      if (meta?.array) {
        const values = splitString(v, {
          delimiters: meta?.arrayDelimiter || ',',
          brackets: true,
          quotes: true
        }).map((x) => unquoteQueryString(decodeURIComponent(x)));
        if (meta.minArrayItems && values.length < meta.minArrayItems)
          throw new Error(`"${k}" parameter requires at least ${meta.minArrayItems} values`);
        if (meta.maxArrayItems && values.length > meta.maxArrayItems)
          throw new Error(`"${k}" parameter accepts up to ${meta.maxArrayItems} values`);
        if (meta.array === 'strict')
          this._add(k, values);
        else
          this._add(k, values.length > 1 ? values : values[0] || '');
      } else {
        this._add(k, unquoteQueryString(decodeURIComponent(v)));
      }

    }
    this.emit('change');
  }

  toString(): string {
    let searchString: string = '';
    this.forEach((value: string, name: string) => {
      const qi = this[QUERYMETADATA_KEY][name.toLowerCase()];
      const format = qi
          ? (typeof qi.format === 'string' ? internalFormats[qi.format] : qi.format)
          : undefined;
      const stringify = (x) => format ? format.stringify(x, name) : (x == null ? '' : '' + x);
      const v = Array.isArray(value) ? value.map(stringify) : stringify(value);
      const x = encodeQueryComponent(name, v);
      if (x) {
        if (searchString.length > 0) searchString += '&';
        searchString += x;
      }
    });
    return searchString;
  }

  [Symbol.iterator](): IterableIterator<[string, any]> {
    return this.entries();
  }

  [nodeInspectCustom]() {
    return this._entries;
  }

  protected _init(init?: (string | URLSearchParams | SearchParams)) {
    if (init instanceof SearchParams)
      this._entries = {...init._entries};
    if (init && typeof init === 'string')
      this.parse(init);
    if ((init instanceof URLSearchParams) || (init instanceof SearchParams)) {
      init.forEach((value: string, name: string) => {
        this.append(name, value);
      });
    }
  }

  protected _add(name: string, value: any): void {
    const qi = this[QUERYMETADATA_KEY][name];
    const format = qi ?
        (typeof qi.format === 'string' ? internalFormats[qi.format] : qi.format) : undefined;
    const fn = (x) => format ? format.parse(x, name) : x;
    const v = Array.isArray(value) ? value.map(fn) : fn(value);
    if (name in this._entries)
      this._entries[name].push(v);
    else
      this._entries[name] = [v];
    this._size++;
    this.emit('change');
  }

}

export class OpraURLSearchParams extends SearchParams {
  constructor(init?: (string | URLSearchParams | SearchParams)) {
    super();
    this.defineParam('$search', {format: 'string'});
    this.defineParam('$filter', {format: 'filter'});
    this.defineParam('$limit', {format: new IntegerFormat({min: 0})});
    this.defineParam('$skip', {format: new IntegerFormat({min: 0})});
    this.defineParam('$pick', {format: 'string', array: 'strict'});
    this.defineParam('$omit', {format: 'string', array: 'strict'});
    this.defineParam('$include', {format: 'string', array: 'strict'});
    this.defineParam('$sort', {format: 'string', array: 'strict'});
    this.defineParam('$distinct', {format: 'boolean'});
    this.defineParam('$total', {format: 'boolean'});
    this._init(init);
  }
}
