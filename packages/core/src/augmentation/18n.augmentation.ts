import fs from 'node:fs';
import path from 'node:path';
import { getStackFileName, I18n as I18n_ } from '@opra/common';

declare module '@opra/common' {
  export interface I18n {
    loadResourceDir(
      dirnames: string | string[],
      deep?: boolean,
      overwrite?: boolean,
    ): Promise<void>;

    loadResourceBundle(
      lang: string,
      ns: string,
      filePath: string,
      deep?: boolean,
      overwrite?: boolean,
    ): Promise<void>;
  }

  namespace I18n {
    function load(): Promise<I18n>;

    export interface Options {
      /**
       * Language to use
       * @default undefined
       */
      lng?: string;

      /**
       * Language to use if translations in user language are not available.
       * @default 'dev'
       */
      fallbackLng?: false | FallbackLng;

      /**
       * Default namespace used if not passed to translation function
       * @default 'translation'
       */
      defaultNS?: string;

      /**
       * Resources to initialize with
       * @default undefined
       */
      resources?: LanguageResource;

      /**
       * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
       * @default undefined
       */
      resourceDirs?: string[];
    }
  }
}

I18n_.load = async function (options?: I18n_.Options) {
  const opts: I18n_.Options = {
    ...options,
  };
  delete opts.resourceDirs;
  const instance = I18n_.createInstance(opts);
  await instance.init();
  await instance.loadResourceDir(
    path.resolve(getStackFileName(), '../../../i18n'),
  );
  if (options?.resourceDirs)
    for (const dir of options.resourceDirs) await instance.loadResourceDir(dir);
  return instance;
};

I18n_.prototype.loadResourceBundle = async function (
  lang: string,
  ns: string,
  filePath: string,
  deep?: boolean,
  overwrite?: boolean,
): Promise<void> {
  let obj;
  if (URL.canParse(filePath)) {
    obj = (
      await fetch(filePath, { headers: { accept: 'application/json' } })
    ).json();
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    obj = JSON.parse(content);
  }
  this.addResourceBundle(lang, ns, obj, deep, overwrite);
};

I18n_.prototype.loadResourceDir = async function (
  dirnames: string | string[],
  deep?: boolean,
  overwrite?: boolean,
) {
  for (const dirname of Array.isArray(dirnames) ? dirnames : [dirnames]) {
    /* istanbul ignore next */
    if (!fs.existsSync(dirname)) continue;
    const languageDirs = fs.readdirSync(dirname);
    for (const lang of languageDirs) {
      const langDir = path.join(dirname, lang);
      if (fs.statSync(langDir).isDirectory()) {
        const nsDirs = fs.readdirSync(langDir);
        for (const nsfile of nsDirs) {
          const nsFilePath = path.join(langDir, nsfile);
          const ext = path.extname(nsfile);
          if (ext === '.json' && fs.statSync(nsFilePath).isFile()) {
            const ns = path.basename(nsfile, ext);
            await this.loadResourceBundle(
              lang,
              ns,
              nsFilePath,
              deep,
              overwrite,
            );
          }
        }
      }
    }
  }
};
