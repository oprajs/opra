import fs from 'fs';
import path from 'path';
import { I18n, isUrlString } from '@opra/common';

declare module "@opra/common" {
  export interface I18n {
    loadResourceDir(
        dirnames: string | string[],
        deep?: boolean,
        overwrite?: boolean
    ): Promise<void>;

    loadResourceBundle(
        lang: string, ns: string,
        filePath: string,
        deep?: boolean,
        overwrite?: boolean
    ): Promise<void>
  }
}

I18n.prototype.loadResourceBundle = async function (
    lang: string, ns: string,
    filePath: string,
    deep?: boolean,
    overwrite?: boolean
): Promise<void> {
  let obj;
  if (isUrlString(filePath)) {
    obj = (await fetch(filePath, {headers: {accept: 'application/json'}})).json();
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    obj = JSON.parse(content);
  }
  this.addResourceBundle(lang, ns, obj, deep, overwrite);
}

I18n.prototype.loadResourceDir = async function (
    dirnames: string | string[],
    deep?: boolean,
    overwrite?: boolean
) {
  for (const dirname of Array.isArray(dirnames) ? dirnames : [dirnames]) {
    /* istanbul ignore next */
    if (!(fs.existsSync(dirname)))
      continue;
    const languageDirs = fs.readdirSync(dirname);
    for (const lang of languageDirs) {
      const langDir = path.join(dirname, lang);
      if ((fs.statSync(langDir)).isDirectory()) {
        const nsDirs = fs.readdirSync(langDir);
        for (const nsfile of nsDirs) {
          const nsFilePath = path.join(langDir, nsfile);
          const ext = path.extname(nsfile);
          if (ext === '.json' && (fs.statSync(nsFilePath)).isFile()) {
            const ns = path.basename(nsfile, ext);
            await this.loadResourceBundle(lang, ns, nsFilePath, deep, overwrite);
          }
        }
      }
    }
  }
}
