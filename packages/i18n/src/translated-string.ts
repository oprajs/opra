import i18next, {i18n, TOptions} from 'i18next';

export const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

let currentInstance: i18n = i18next;

interface Translating {
  key: string | string[];
  options?: TOptions<Record<string, any>>;

  toJSON(): string;
}

export interface TranslatingConstructor {
  new(key: string | string[], options?: TOptions<Record<string, any>>): Translating;

  (key: string | string[], options?: TOptions<Record<string, any>>): Translating;

  readonly prototype: Translating;
  setI18n(inst: i18n):void;
}

export const TranslatingConstructor = function (key, options) {
  // @ts-ignore
  if (!(this instanceof Translating))
    // @ts-ignore
    return new Translating(key, options) as void;
  // @ts-ignore
  this.key = key;
  // @ts-ignore
  this.options = options;
} as TranslatingConstructor;

TranslatingConstructor.setI18n = function (inst: i18n) {
  currentInstance = inst;
}


TranslatingConstructor.prototype.toString = function () {
  return currentInstance.t(this.key, this.options);
}

TranslatingConstructor.prototype.toJSON = function () {
  return this.toString();
}

TranslatingConstructor.prototype[nodeInspectCustom] = function () {
  return this.toString();
}

export const Translating = TranslatingConstructor;

export function isTranslation(obj: any): obj is Translating {
  return obj && (obj instanceof Translating ||
    Object.getPrototypeOf(obj).constructor.name === 'Translating');
}
