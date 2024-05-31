import type { SpecVersion } from './constants.js';
import type { DataTypeContainer } from './data-type-container.interface.js';
import type { HttpController } from './http/http-controller.interface';

export type Protocol = 'http' | 'ws' | 'rpc';

/**
 * @interface Document
 */
export interface Document extends DataTypeContainer {
  spec: SpecVersion;
  url?: string;
  info?: DocumentInfo;
  references?: Record<string, string | Document>;
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

export interface Api extends DataTypeContainer {
  protocol: Protocol;
  /**
   * Name of the api. Should be a computer friendly name
   */
  name: string;
  description?: string;
}

export interface HttpApi extends Api {
  protocol: 'http';
  description?: string;
  url?: string;
  root: HttpRoot;
}

/**
 * @interface HttpRoot
 */
export interface HttpRoot extends Pick<HttpController, 'operations' | 'children' | 'types' | 'parameters'> {}
