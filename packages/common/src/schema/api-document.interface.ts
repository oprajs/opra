import type { SpecVersion } from './constants.js';
import type { Http } from './http.js';
import type { DocumentElement } from './type-scope.interface';

export type Protocol = 'http' | 'ws' | 'rpc';

/**
 * @interface ApiDocument
 */
export interface ApiDocument extends DocumentElement {
  spec: SpecVersion;
  url?: string;
  info: DocumentInfo;
  references?: Record<string, string | ApiDocument>;
  services: Record<string, Http.Service>;
}

/**
 * @interface DocumentInfo
 */
export interface DocumentInfo {
  title: string;
  version: string;
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
 * @interface Service
 */
export interface Service extends DocumentElement {
  description?: string;
  protocol: Protocol;
}
