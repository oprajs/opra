import type { SpecVersion } from './constants.js';
import type { DataTypeContainer } from './data-type-container.interface.js';
import type { HttpApi } from './http/http-api.interface.js';
import type { MQApi } from './mq/mq-api.interface.js';
import type { WSApi } from './ws/ws-api.interface.js';

/**
 * @interface ApiDocument
 */
export interface ApiDocument extends DataTypeContainer {
  spec: SpecVersion;
  id: string;
  url?: string;
  info?: DocumentInfo;
  references?: Record<string, DocumentReference>;
  api?: HttpApi | MQApi | WSApi;
}

/**
 * @interface DocumentInfo
 */
export interface DocumentInfo {
  title?: string;
  version?: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactPerson[];
  license?: LicenseInfo;
}

/**
 * @interface ContactPerson
 */
export interface ContactPerson {
  name?: string;
  email?: string;
  url?: string;
}

/**
 * @interface LicenseInfo
 */
export interface LicenseInfo {
  name: string;
  url?: string;
  content?: string;
}

/**
 * @interface DocumentReference
 */
export interface DocumentReference
  extends Pick<ApiDocument, 'id' | 'url' | 'info'> {}
