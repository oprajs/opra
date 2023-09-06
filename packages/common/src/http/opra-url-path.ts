import { splitString, tokenize } from 'fast-tokenizer';
import isPlainObject from 'putil-isplainobject';

const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');
const kLength = Symbol.for('kLength');

type ResourceKey = Record<string, string | number | boolean | null>;
const pathComponentRegEx = /^([^/?#:@]+)(?:@([^/?#:]*))?(?:::(.*))?$/;
const decimalPattern = /^[+-]?\d+(\.\d+)?$/
const booleanPattern = /^true|false$/;

/**
 * @class OpraURLPath
 */
export class OpraURLPath {
  protected [kLength]: number = 0;

  [index: number]: OpraURLPathComponent;

  constructor(...init: (OpraURLPath.ComponentLike | null | undefined)[]) {
    this._resolve(init.filter(x => x) as any);
  }

  get length(): number {
    return this[kLength];
  }

  slice(start?: number, end?: number): OpraURLPath {
    return new OpraURLPath(...[...this].slice(start, end));
  }

  resolve(...items: OpraURLPath.ComponentLike[]): this {
    this._resolve(items);
    return this;
  }

  join(...items: OpraURLPath.ComponentLike[]): OpraURLPath {
    this._resolve(items, true);
    return this;
  }

  isRelativeTo(basePath: string | OpraURLPath): boolean {
    basePath = basePath instanceof OpraURLPath ? basePath : new OpraURLPath(basePath);
    let i: number;
    for (i = 0; i < basePath.length; i++) {
      if (String(this[i]) !== String(basePath[i]))
        return false;
    }
    return true;
  }

  forEach(callback: (component: OpraURLPathComponent, index: number, _this: this) => void) {
    let i = 0;
    for (const item of this.values()) {
      callback.call(this, item, i++, this);
    }
  }

  values(): IterableIterator<OpraURLPathComponent> {
    const arr = new Array(this.length);
    for (let i = 0; i < this.length; i++)
      arr[i] = this[i];
    return arr.values();
  }

  toString(): string {
    const v = Array.from(this).join('/');
    return v ? '/' + v : '';
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return `(UrlPath [${this.toString()}])`;
  }

  [Symbol.iterator](): IterableIterator<OpraURLPathComponent> {
    return this.values();
  }

  protected _resolve(items: OpraURLPath.ComponentLike | OpraURLPath.ComponentLike[], join?: boolean) {
    let paths = (Array.isArray(items) ? items : [items]).map(item => {
      if (typeof item === 'object' && !(item instanceof OpraURLPath || item instanceof OpraURLPathComponent))
        item = new OpraURLPathComponent(item);
      item = String(item);
      // Remove url parts coming after path (query, hash parts)
      if (item.includes('?'))
        item = splitString(item, {
          delimiters: '?',
          quotes: true,
          brackets: true,
          keepBrackets: true,
          keepQuotes: true
        })[0];
      if (item.includes('#'))
        item = splitString(item, {
          delimiters: '#',
          quotes: true,
          brackets: true,
          keepBrackets: true,
          keepQuotes: true
        })[0];
      return join ? removeLeadingSeparator(item) : item;
    });

    const oldLength = this.length;
    let n = 0;
    if (!join) {
      for (n = paths.length - 1; n >= 0; n--) {
        if (String(items[n]).startsWith('/'))
          break;
      }
      if (n > 0)
        paths = paths.slice(n);
    }

    const newPath = paths[0]?.startsWith('/') ? [] : Array.from(this).map(String);
    for (let i = 0; i < paths.length; i++) {
      const pathTokenizer = tokenize(paths[i], {delimiters: '/', quotes: true, brackets: true});
      for (const x of pathTokenizer) {
        if (!x)
          continue;
        if (x.startsWith('.')) {
          if (x === '.')
            continue;
          if (x === '..') {
            newPath.pop();
            continue;
          }
          throw new TypeError('Invalid path string');
        }
        newPath.push(x);
      }
    }
    for (let i = 0; i < newPath.length; i++) {
      this[i] = OpraURLPathComponent.parse(newPath[i]);
    }
    for (let i = newPath.length; i < oldLength; i++) {
      delete this[i];
    }
    this[kLength] = newPath.length;
  }

  static join(...items: OpraURLPath.ComponentLike[]) {
    const instance = new OpraURLPath();
    instance.join(...items);
    return instance;
  }

  static resolve(...items: OpraURLPath.ComponentLike[]) {
    return new OpraURLPath(...items);
  }

  static relative(source: string | OpraURLPath, basePath: string | OpraURLPath): OpraURLPath | undefined {
    source = source instanceof OpraURLPath ? source : new OpraURLPath(source);
    basePath = basePath instanceof OpraURLPath ? basePath : new OpraURLPath(basePath);
    let i: number;
    for (i = 0; i < basePath.length; i++) {
      if (String(source[i]) !== String(basePath[i]))
        return;
    }
    return new OpraURLPath(Array.from(source).slice(i).join('/'))
  }

}

export namespace OpraURLPath {
  export type ComponentLike = string | OpraURLPath | OpraURLPathComponent | OpraURLPathComponent.Initiator;
}

/**
 *
 * @class OpraURLPathComponent
 */
class OpraURLPathComponent {
  resource: string;
  key?: string | number | ResourceKey;
  args?: Record<string, any>;
  typeCast?: string

  constructor(init: OpraURLPathComponent.Initiator) {
    this.resource = init.resource;
    this.key = init.key;
    this.args = init.args;
    this.typeCast = init.typeCast;
  }

  toString() {
    let out = encodeURIComponent(this.resource).replace(/%24/, '$');
    if (this.key) {
      if (typeof this.key === 'object' && isPlainObject(this.key)) {
        const arr: string[] = [];
        for (const k of Object.keys(this.key)) {
          let v = this.key[k];
          if (typeof v === 'number' || typeof v === 'boolean')
            v = String(v);
          else v = '"' + encodeURIComponent(String(v)) + '"';
          arr.push(encodeURIComponent(k) + '=' + v);
        }
        out += '@' + arr.join(';');
      } else out += '@' + encodeURIComponent(String(this.key));
    }

    if (this.args) {
      const arr: string[] = [];
      for (const k of Object.keys(this.args)) {
        arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(this.args[k])));
      }
      out += '(' + arr.join(';') + ')';
    }

    if (this.typeCast)
      out += '::' + encodeURIComponent(this.typeCast);

    return out;
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return this.toString();
  }

  /**
   * Factory method.
   * @param input
   */
  static parse(input: string): OpraURLPathComponent {
    const m = pathComponentRegEx.exec(input);
    if (!m)
      throw Object.assign(
          new TypeError('Invalid Opra URL'), {
            code: 'ERR_INVALID_OPRA_URL',
            input,
          });
    let key: any;
    if (m[2]) {
      const s = decodeURIComponent(m[2]);
      const b = splitString(s, {delimiters: ';', quotes: true, escape: false, keepQuotes: true, keepBrackets: true})
      for (const n of b) {
        const c = splitString(n, {delimiters: '=', quotes: true, escape: false, keepQuotes: true, keepBrackets: true});
        if ((b.length > 1 && c.length < 2) ||
            (key &&
                (c.length >= 2 && typeof key !== 'object') ||
                (c.length < 2 && typeof key === 'object')
            )
        )
          throw Object.assign(
              new TypeError('Invalid Opra URL. name:value pair required for multiple key format'), {
                pathComponent: input,
                code: 'ERR_INVALID_OPRA_URL'
              });

        if (c.length >= 2) {
          key = key || {};
          const k = c.shift() || '';
          let v: any = c.join('=');
          if (decimalPattern.test(v))
            v = Number(v);
          else if (booleanPattern.test(v))
            v = Boolean(v);
          else if (v.startsWith('"') && v.endsWith('"'))
            v = v.substring(1, v.length - 1);
          else if (v.startsWith("'") && v.endsWith("'"))
            v = v.substring(1, v.length - 1);
          key[k] = v;
        } else {
          if (decimalPattern.test(c[0]))
            key = Number(c[0]);
          else if (booleanPattern.test(c[0]))
            key = Boolean(c[0]);
          else key = c[0];
        }
      }
      return new OpraURLPathComponent({
        resource: decodeURIComponent(m[1]),
        key,
        typeCast: m[3] ? decodeURIComponent(m[3]) : undefined
      });
    }
    return new OpraURLPathComponent({
      resource: decodeURIComponent(m[1]),
      typeCast: m[3] ? decodeURIComponent(m[3]) : undefined
    });
  }
}

export namespace OpraURLPathComponent {
  export interface Initiator {
    resource: string;
    key?: string | number | ResourceKey;
    args?: Record<string, any>;
    typeCast?: string;
  }
}

function removeLeadingSeparator(s: string): string {
  const m = /^\/*(.*)/.exec(s);
  return m?.[1] || s;
}
