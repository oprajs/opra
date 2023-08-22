import type { SpecVersion } from './constants.js';
import type { DataType } from './data-type/data-type.interface.js';
import type { Resource } from './resource/resource.interface';

export interface ApiDocument {
  version: SpecVersion;
  url?: string;
  info: DocumentInfo;
  references?: Record<string, string | ApiDocument>;
  types?: Record<DataType.Name, DataType>;
  resources?: Record<Resource.Name, Resource>;
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
