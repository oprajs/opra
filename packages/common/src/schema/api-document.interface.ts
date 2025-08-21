import type { SpecVersion } from './constants.js';
import type { DataTypeContainer } from './data-type-container.interface.js';
import type { HttpController } from './http/http-controller.interface.js';
import type { MQController } from './mq/mq-controller.interface.js';

export type Transport =
  /** Custom **/
  | 'custom'
  /** HTTP **/
  | 'http'
  /** WebSocket*/
  | 'ws'
  /** Message Queue (Kafka, RabbitMQ, MQTT etc) */
  | 'mq'
  /** Remote Procedure Call (gRPC etc) */
  | 'rpc';

/**
 * @interface ApiDocument
 */
export interface ApiDocument extends DataTypeContainer {
  spec: SpecVersion;
  id: string;
  url?: string;
  info?: DocumentInfo;
  references?: Record<string, DocumentReference>;
  api?: HttpApi | MQApi;
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

/**
 * @interface Api
 */
export interface Api extends DataTypeContainer {
  transport: Transport;
  /**
   * Name of the api. Should be a computer-friendly name
   */
  name: string;
  description?: string;
}

/**
 * HTTP Api
 * @interface HttpApi
 */
export interface HttpApi extends Api {
  transport: 'http';
  description?: string;
  url?: string;
  controllers: Record<string, HttpController>;
}

/**
 * Message Queue Api
 * @interface MQApi
 */
export interface MQApi extends Api {
  transport: 'mq';
  /**
   * Name of the platform. (Kafka, RabbitMQ, etc.)
   */
  platform: string;
  description?: string;
  controllers: Record<string, MQController>;
}

// /**
//  * RPC Api
//  * @interface MQApi
//  */
// export interface MQApi extends Api {
//   transport: 'rpc';
//   /**
//    * Name of the platform. (gRPC etc.)
//    */
//   platform: string;
//   description?: string;
//   controllers: Record<string, MQController>;
// }
