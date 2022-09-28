import path from 'path';
import { I18n } from '@opra/i18n';
import { OpraAdapter } from '../implementation/adapter.js';
import { getCallerFile } from './get-caller-file.util.js';

export async function createI18n(options?: OpraAdapter.I18nOptions): Promise<I18n> {
  const opts: OpraAdapter.I18nOptions = {
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
