export type HttpMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'SEARCH';

export type HttpParameterLocation = 'cookie' | 'header' | 'query' | 'path';

export type HttpMultipartFieldType = 'field' | 'file';

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
