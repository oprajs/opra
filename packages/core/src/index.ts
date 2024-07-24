import 'reflect-metadata';
import './augmentation/18n.augmentation.js';
import './augmentation/http-controller.augmentation.js';
import * as HttpIncomingHost_ from './http/impl/http-incoming.host.js';
import * as HttpOutgoingHost_ from './http/impl/http-outgoing.host.js';
import * as NodeIncomingMessageHost_ from './http/impl/node-incoming-message.host.js';
import * as NodeOutgoingMessageHost_ from './http/impl/node-outgoing-message.host.js';

export * from './execution-context.js';
export * from './helpers/service-base.js';
export * from './http/express-adapter.js';
export * from './http/http-adapter.js';
export * from './http/http-context.js';
export * from './http/http-handler.js';
export * from './http/impl/multipart-reader.js';
export * from './http/interfaces/http-incoming.interface.js';
export * from './http/interfaces/http-outgoing.interface.js';
export * from './http/interfaces/node-incoming-message.interface.js';
export * from './http/interfaces/node-outgoing-message.interface.js';
export * from './http/utils/wrap-exception.js';
export * from './interfaces/logger.interface.js';
export * from './platform-adapter.js';
export * from './type-guards.js';

export namespace classes {
  export import HttpIncomingHost = HttpIncomingHost_.HttpIncomingHost;
  export import HttpOutgoingHost = HttpOutgoingHost_.HttpOutgoingHost;
  export import NodeIncomingMessageHost = NodeIncomingMessageHost_.NodeIncomingMessageHost;
  export import NodeOutgoingMessageHost = NodeOutgoingMessageHost_.NodeOutgoingMessageHost;
}
