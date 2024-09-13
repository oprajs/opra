import type { SpecVersion } from './constants.js';
import type { DataTypeContainer } from './data-type-container.interface.js';
import type { HttpController } from './http/http-controller.interface.js';

export type Protocol = 'http' | 'ws' | 'rpc' | 'kafka';

/**
 * @interface ApiDocument
 */
export interface ApiDocument extends DataTypeContainer {
  spec: SpecVersion;
  id: string;
  url?: string;
  info?: DocumentInfo;
  references?: Record<string, DocumentReference>;
  api?: HttpApi;
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
export interface DocumentReference extends Pick<ApiDocument, 'id' | 'url' | 'info'> {}

/**
 * @interface Api
 */
export interface Api extends DataTypeContainer {
  protocol: Protocol;
  /**
   * Name of the api. Should be a computer friendly name
   */
  name: string;
  description?: string;
}

/**
 * @interface HttpApi
 */
export interface HttpApi extends Api {
  protocol: 'http';
  description?: string;
  url?: string;
  controllers: Record<string, HttpController>;
}
