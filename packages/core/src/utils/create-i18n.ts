import path from 'path';
import { I18n } from '@opra/common';
import { I18nOptions } from '../interfaces/i18n-options.interface.js';
import { getCallerFile } from './get-caller-file.util.js';

export async function createI18n(options?: I18nOptions): Promise<I18n> {
  const opts: I18nOptions = {
    ...options,
  }
  delete opts.resourceDirs;
  const instance = I18n.createInstance(opts);
  await instance.init();
  await instance.loadResourceDir(path.resolve(getCallerFile(), '../../../i18n'));
  if (options?.resourceDirs)
    for (const dir of options.resourceDirs)
      await instance.loadResourceDir(dir);
  return instance;
}
