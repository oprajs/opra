import {EventEmitter} from 'events';
import {nodeInspectCustom, QueryParseFunction} from './types';
import {tokenize} from './utils/tokenizer';

export class OwoURLSearchParams extends EventEmitter {
  private _entries: Record<string, any[]> = {};
  private _size = 0;
  public parser?: QueryParseFunction;

  constructor(init?: (string | URLSearchParams | OwoURLSearchParams), parser?: QueryParseFunction) {
    super();
    this.parser = parser;
    if (init && typeof init === 'string') {
      this.parse(init);
    } else if ((init instanceof URLSearchParams) || (init instanceof OwoURLSearchParams)) {
      init.forEach((value: string, name: string) => {
        this.append(name, value);
      });
    }
  }

  get size(): number {
    return this._size;
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
    const v = this._entries[name][index || 0];
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
    const a = this._entries[name];
    if (a) this._size -= a.length;
    if (value != null) {
      this._size++;
      this._entries[name] = [value];
      this.emit('change');
    }
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
      const k = decodeQueryComponent(itemTokenizer.next() || '');
      const t = decodeQueryComponent(itemTokenizer.join('=') || '');
      const v = this.parser ? this.parser(t, k) : t;
      this._add(k, v);
    }
    this.emit('change');
  }

  toString(): string {
    let searchString: string = '';
    this.forEach((value: string, name: string) => {
      name = encodeQueryComponent(name);
      value = encodeQueryComponent(value);
      if (searchString.length > 0) searchString += '&';
      searchString += name + (!value ? '' : '=' + value);
    });
    return searchString;
  }

  [Symbol.iterator](): IterableIterator<[string, any]> {
    return this.entries();
  }

  [nodeInspectCustom]() {
    return this._entries;
  }

  protected _add(name: string, value: any): void {
    if (name in this._entries)
      this._entries[name].push(value);
    else
      this._entries[name] = [value];
    this._size++;
  }

}

const invalidCharRegEx = /[#&]/g;
const encodeQueryComponentReplaces = (c) => {
  return '%' + c.charCodeAt(0).toString(16);
}

function encodeQueryComponent(it: string): string {
  if (it == null || it === '')
    return '';
  const tokenizer = tokenize(it, {
    delimiters: '',
    quotes: true,
    brackets: true,
    keepQuotes: true,
    keepBrackets: true,
    keepDelimiters: true
  })
  let out = '';
  for (const x of tokenizer) {
    if ('(['.includes(x.charAt(0)) || '"\'`'.includes(x.charAt(0)))
      out += x;
    else
      out += x.replace(invalidCharRegEx, encodeQueryComponentReplaces)
  }
  return out;
}

function decodeQueryComponent(it: string): string {
  if (it == null || it === '')
    return '';
  const tokenizer = tokenize(it, {
    delimiters: '',
    quotes: true,
    brackets: true,
    keepQuotes: true,
    keepBrackets: true,
    keepDelimiters: true
  })
  let out = '';
  for (const x of tokenizer) {
    if ('(['.includes(x.charAt(0)) || '"\'`'.includes(x.charAt(0)))
      out += x;
    else
      out += decodeURIComponent(x)
  }
  return out;
}
