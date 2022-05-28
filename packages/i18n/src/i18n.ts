import i18next, {Callback, Formatter, i18n, InitOptions, TOptions} from 'i18next';
import {isTranslation} from './translated-string';

declare module 'i18next' {
  interface i18n {
    deep(input: any, options?: TOptions): any;

    loadResourceBundle(lng: string, ns: string, filePath: string,
                       deep?: boolean, overwrite?: boolean): Promise<void>;

    loadResourceDir(dirname: string | string[], deep?: boolean, overwrite?: boolean): Promise<void>;

    registerLocaleDir(...dirname: string[]): void;
  }

  interface InitOptions {
    resourceDirs?: string[];
  }
}

const globalLocaleDirs: string[] = [];

/**
 * Apply mixin
 * @param inst
 */
function applyMixin(inst: i18n) {
  // Override init
  const oldInit = inst.init;
  // @ts-ignore
  inst.init = async function (...args: any[]) {
    const result = oldInit(...args);
    await result;

    // Add formatters
    const formatter = i18next.services.formatter as Formatter;
    formatter.add('lowercase', (value, lng) => value.toLocaleLowerCase(lng));
    formatter.add('uppercase', (value, lng) => value.toLocaleUpperCase(lng));
    formatter.add('upperFirst', (value, lng) => value.charAt(0).toLocaleUpperCase(lng) + value.substring(1));

    // Load globally registered resources
    await inst.loadResourceDir(globalLocaleDirs, false, true);

    const options: InitOptions = typeof args[0] === 'object' ? args[0] : {};
    // Load resource dirs and overwrite existing
    if (options.resourceDirs) {
      await inst.loadResourceDir(options.resourceDirs, false, true);
    }
    // overwrite existing resources with options.resources
    if (options?.resources) {
      for (const lang of Object.keys(options.resources)) {
        const langObj = options.resources[lang];
        for (const ns of Object.keys(langObj)) {
          inst.addResourceBundle(lang, ns, langObj[ns], false, true);
        }
      }
    }
  }

  inst.registerLocaleDir = function (...dirname: string[]): void {
    globalLocaleDirs.push(...dirname);
  }

  inst.deep = function (input: any, options?: TOptions) {
    if (input == null)
      return input;
    const objectStack = new WeakMap();
    return deepTranslate(this, input, objectStack, options);
  }

  inst.loadResourceBundle = async function (
    lang: string, ns: string, filePath: string,
    deep?: boolean, overwrite?: boolean
  ): Promise<void> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf8');
    const obj = JSON.parse(content);
    i18next.addResourceBundle(lang, ns, obj, deep, overwrite);
  }

  inst.loadResourceDir = async function (dirnames: string | string[], deep?: boolean, overwrite?: boolean): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    for (const dirname of Array.isArray(dirnames) ? dirnames : [dirnames]) {
      if (!(await fs.stat(dirname)).isDirectory()) {
        // eslint-disable-next-line no-console
        console.warn(`Locale directory does not exists. (${dirname})`);
        continue;
      }
      const languageDirs = await fs.readdir(dirname);
      for (const lang of languageDirs) {
        const langDir = path.join(dirname, lang);
        if ((await fs.stat(langDir)).isDirectory()) {
          const nsDirs = await fs.readdir(langDir);
          for (const nsfile of nsDirs) {
            const nsFile = path.join(langDir, nsfile);
            const ext = path.extname(nsfile);
            const ns = path.basename(nsfile, ext);
            if (ext === '.json' && (await fs.stat(nsFile)).isFile()) {
              const content = await fs.readFile(nsFile, 'utf8');
              const obj = JSON.parse(content);
              i18next.addResourceBundle(lang, ns, obj, deep, overwrite);
            }
          }
        }
      }
    }
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

