import { splitString, tokenize } from 'fast-tokenizer';
import { Type } from 'ts-gems';
import i18next, {
  FallbackLng,
  Formatter as I18nextFormatter,
  i18n,
  InitOptions as I18nextInitOptions,
  Resource as I18nextResource,
  TFunction as I18nextTFunction,
  TOptions,
} from '@browsery/i18next';
import * as I18next from '@browsery/i18next';
import { unescapeString } from './string-utils.js';

export type BaseI18n = Type<I18next.i18n>;
export const BaseI18n = Object.getPrototypeOf(i18next.createInstance()).constructor as BaseI18n;
export type DeepTranslateOptions = TOptions & { ignore?: (input: any, inst: i18n) => boolean };
export type InitCallback = I18next.Callback;
export type TranslateFunction = I18nextTFunction;
export type Formatter = I18nextFormatter;
export type LanguageResource = I18nextResource;
export type { FallbackLng };

export interface InitOptions extends I18nextInitOptions {
  resourceDirs?: string[];
}

export class I18n extends BaseI18n {
  async init(callback?: InitCallback): Promise<TranslateFunction>;
  async init(options: InitOptions, callback?: InitCallback): Promise<TranslateFunction>;
  async init(arg0?: InitOptions | InitCallback, arg1?: InitCallback): Promise<TranslateFunction> {
    const options: InitOptions = typeof arg0 === 'object' ? arg0 : {};
    const callback = typeof arg0 === 'function' ? arg0 : arg1;
    try {
      const t = await super.init(options, callback);

      // Add formatters
      const formatter = this.services.formatter as Formatter;
      formatter.add('lowercase', (value, lng) => value.toLocaleLowerCase(lng));
      formatter.add('uppercase', (value, lng) => value.toLocaleUpperCase(lng));
      formatter.add('upperFirst', (value, lng) => value.charAt(0).toLocaleUpperCase(lng) + value.substring(1));

      // overwrite existing resources with options.resources
      if (options?.resources) {
        for (const lang of Object.keys(options.resources)) {
          const langObj = options.resources[lang];
          for (const ns of Object.keys(langObj)) {
            this.addResourceBundle(lang, ns, langObj[ns], false, true);
          }
        }
      }
      if (callback) callback(null, t);
      return t;
    } catch (err) {
      if (callback) callback(err, this.t);
      throw err;
    }
  }

  deep(input: any, options?: DeepTranslateOptions): any {
    if (input == null) return input;
    const objectStack = new WeakMap();
    return this._deepTranslate(input, objectStack, options);
  }

  createInstance(options = {}, callback): I18n {
    return new I18n(options, callback);
  }

  static createInstance(options?: InitOptions, callback?: InitCallback): I18n {
    return new I18n(options, callback);
  }

  protected _deepTranslate(input: any, objectStack: WeakMap<object, any>, options?: DeepTranslateOptions): any {
    if (input == null) return input;

    if (options?.ignore && options.ignore(input, this)) return input;

    if (typeof input === 'object' && objectStack.has(input)) return objectStack.get(input);

    if (typeof input === 'string') {
      let s = '';
      for (let token of tokenize(input, {
        brackets: { '$t(': ')' },
        quotes: true,
        keepQuotes: true,
        keepBrackets: true,
        keepDelimiters: true,
      })) {
        if (token.startsWith('$t(') && token.endsWith(')')) {
          token = token.substring(3, token.length - 1);
          const a = splitString(token, { delimiters: '?', quotes: true, brackets: { '{': '}' } });
          const fallback = unescapeString(token.substring((a[0] || '').length + 1));
          token = a[0] || '';

          const keys: string[] = [];
          let opts: any = null;
          for (const token2 of tokenize(token, { delimiters: ',', quotes: true, brackets: { '{': '}' } })) {
            if (token2.startsWith('{')) {
              opts = JSON.parse(token2);
              continue;
            }
            keys.push(token2);
          }
          const k = keys.length > 1 ? '$t(' + keys.join(',') + ')' : keys[0];
          s += fallback
            ? (this.t(k, fallback, { ...options, ...opts }) as string)
            : (this.t(k, { ...options, ...opts }) as string);
          continue;
        }
        s += token;
      }
      return s;
    }

    if (Array.isArray(input)) {
      const out = Array(input.length);
      objectStack.set(input, out);
      for (let i = 0, l = input.length; i < l; i++) {
        out[i] = this._deepTranslate(input[i], objectStack, options);
      }
      objectStack.delete(input);
      return out;
    }

    if (typeof input === 'object') {
      if (Buffer.isBuffer(input)) return input;
      if (
        Buffer.isBuffer(input) ||
        input instanceof Symbol ||
        input instanceof RegExp ||
        input instanceof Map ||
        input instanceof Set ||
        input instanceof WeakMap ||
        input instanceof WeakSet
      )
        return input;

      const out = {};
      objectStack.set(input, out);
      const keys = Object.keys(input);
      for (let i = 0, l = keys.length; i < l; i++) {
        const k = keys[i];
        out[k] = this._deepTranslate(input[k], objectStack, options);
      }
      objectStack.delete(input);
      return out;
    }

    return input;
  }

  static get defaultInstance() {
    return defaultInstance;
  }
}

const defaultInstance = I18n.createInstance();
