import { I18n } from '@opra/i18n';

export interface OpraAdapterOptions {
  i18n?: I18n;
}

export type OpraHttpAdapterOptions = OpraAdapterOptions & {
  prefix?: string;
}

