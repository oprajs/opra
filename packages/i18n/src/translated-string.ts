import i18next, {i18n, TOptions} from 'i18next';

export const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

let currentInstance: i18n = i18next;

interface Translation {
  key: string | string[];
  defaultText?: string;
  options?: TOptions<Record<string, any>>;

  toString(): string;

  toJSON(): string;
}

interface TranslationConstructor {
  key: string | string[];
  defaultText?: string;
  options?: TOptions<Record<string, any>>;

  new(key: string | string[], options?: TOptions<Record<string, any>>): Translation;

  new(key: string | string[], defaultText: string, options?: TOptions<Record<string, any>>): Translation;

  (key: string | string[], options?: TOptions<Record<string, any>>): Translation;

  (key: string | string[], defaultText: string, options?: TOptions<Record<string, any>>): Translation;

  readonly prototype: Translation;

  setI18n(inst: i18n): void;

  toString(): string;

  toJSON(): string;
}

const TranslationConstructor = function (key: string, ...args: any[]) {
  // @ts-ignore
  if (!(this instanceof Translation))
    // @ts-ignore
    return new Translation(key, ...args) as void;
  // @ts-ignore
  const _this: Translation = this;
  _this.key = key;
  _this.defaultText = typeof args[0] === 'string' ? args[0] : undefined;
  _this.options = typeof args[0] === 'object' ? args[0] : args[1];
} as TranslationConstructor;

TranslationConstructor.setI18n = function (inst: i18n) {
  currentInstance = inst;
}

TranslationConstructor.prototype.toString = function () {
  const keys = Array.isArray(this.key)
    ? [...this.key, this.defaultText || '']
    : [this.key, this.defaultText || ''];
  return currentInstance.t(keys, this.options);
}

/* istanbul ignore next */
TranslationConstructor.prototype.toJSON = function () {
  return this.toString();
}

/* istanbul ignore next */
TranslationConstructor.prototype[nodeInspectCustom] = function () {
  return this.toString();
}

const Translation = TranslationConstructor;
Object.defineProperty(Translation, 'name', {
  value: 'Translation'
});

export {Translation};

export function isTranslation(obj: any): obj is Translation {
  return obj && (obj instanceof Translation ||
    Object.getPrototypeOf(obj).constructor.name === 'Translation');
}
