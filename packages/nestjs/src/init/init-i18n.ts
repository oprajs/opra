import '@opra/i18n';
import i18next, {InitOptions} from 'i18next';
import {I18nInitOptions} from '../opra.interface';

export async function initI18n(options?: I18nInitOptions) {
  const initOptions: InitOptions = {
    lng: options?.lng,
    fallbackLng: options?.fallbackLng,
    defaultNS: options?.defaultNS,
    resources: options?.resources,
    resourceDirs: options?.resourceDirs
  }
  await i18next.init(initOptions);
}

