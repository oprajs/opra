import i18next, {Callback, Formatter, i18n, InitOptions, TOptions} from 'i18next';
import {isTranslation} from './translated-string';

export * from './translated-string';

declare module 'i18next' {
  interface i18n {
    deep(input: any, options?: TOptions): any;
  }
}

/**
 * Apply mixin
 * @param inst
 */
function applyMixin(inst: i18n) {
  const onInit = () => {
    inst.off('initialized', onInit);
    const formatter = i18next.services.formatter as Formatter;
    formatter.add('lowercase', (value, lng) => value.toLocaleLowerCase(lng));
    formatter.add('uppercase', (value, lng) => value.toLocaleUpperCase(lng));
    formatter.add('upperFirst', (value, lng) => value.charAt(0).toLocaleUpperCase(lng) + value.substring(1));
  }
  inst.on('initialized', onInit);

  inst.deep = function (input: any, options?: TOptions) {
    if (input == null)
      return input;
    const objectStack = new WeakMap();
    return deepTranslate(this, input, objectStack, options);
  }

}

applyMixin(i18next);

const oldCreateInstance = i18next.createInstance;
i18next.createInstance = function (options?: InitOptions, callback?: Callback): i18n {
  const inst = oldCreateInstance(options, callback);
  applyMixin(inst);
  return inst;
}

function deepTranslate(inst: i18n, input: any, objectStack: WeakMap<object, any>, options?: TOptions): any {
  if (input == null)
    return input;

  if (typeof input === 'object' && objectStack.has(input))
    return objectStack.get(input);

  if (typeof input === 'string')
    return inst.t(input, options);

  if (Array.isArray(input)) {
    const out = Array(input.length);
    objectStack.set(input, out);
    for (let i = 0, l = input.length; i < l; i++) {
      out[i] = deepTranslate(inst, input[i], objectStack, options);
    }
    objectStack.delete(input);
    return out;
  }

  if (typeof input === 'object') {
    if (isTranslation(input)) {
      return inst.t(input.key, {...options, ...input.options});
    }
    const out = {};
    objectStack.set(input, out);
    const keys = Object.keys(input);
    for (let i = 0, l = keys.length; i < l; i++) {
      const k = keys[i];
      out[k] = deepTranslate(inst, input[k], objectStack, options);
    }
    objectStack.delete(input);
    return out;
  }

  return input;
}

