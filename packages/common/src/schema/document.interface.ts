import type { SpecVersion } from './constants.js';
import type { DataType } from './data-type/data-type.interface.js';
import type { Source } from './source/source.interface.js';

export interface ApiDocument {
  version: SpecVersion;
  url?: string;
  info: DocumentInfo;
  references?: Record<string, string | ApiDocument>;
  types?: Record<DataType.Name, DataType>;
  sources?: Record<Source.Name, Source>;
  servers?: ServerInfo[];
}

export type DocumentInfo = {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactPerson[];
  license?: LicenseInfo;
}

export type ServerInfo = {
  url: string;
  description?: string;
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
