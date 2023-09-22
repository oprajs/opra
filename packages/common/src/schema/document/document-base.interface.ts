import type { SpecVersion } from '../constants';

export interface DocumentBase {
  version: SpecVersion;
  url?: string;
  info: DocumentInfo;
}

export type DocumentInfo = {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactPerson[];
  license?: LicenseInfo;
}

export type ContactPerson = {
  name?: string;
  email?: string;
  url?: string;
}

export type LicenseInfo = {
  name: string;
  url?: string;
  content?: string;
}
