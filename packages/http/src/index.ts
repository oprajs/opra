import 'reflect-metadata';
import './augmentation/http-controller.augmentation.js';
import * as HttpIncomingHost_ from './impl/http-incoming.host.js';
import * as HttpOutgoingHost_ from './impl/http-outgoing.host.js';
import * as NodeIncomingMessageHost_ from './impl/node-incoming-message.host.js';
import * as NodeOutgoingMessageHost_ from './impl/node-outgoing-message.host.js';

export * from './express-adapter.js';
export * from './http-adapter.js';
export * from './http-context.js';
export * from './http-handler.js';
export * from './impl/multipart-reader.js';
export * from './interfaces/http-incoming.interface.js';
export * from './interfaces/http-outgoing.interface.js';
export * from './interfaces/node-incoming-message.interface.js';
export * from './interfaces/node-outgoing-message.interface.js';
export * from './type-guards.js';
export * from './utils/wrap-exception.js';

export namespace classes {
  export import HttpIncomingHost = HttpIncomingHost_.HttpIncomingHost;
  export import HttpOutgoingHost = HttpOutgoingHost_.HttpOutgoingHost;
  export import NodeIncomingMessageHost = NodeIncomingMessageHost_.NodeIncomingMessageHost;
  export import NodeOutgoingMessageHost = NodeOutgoingMessageHost_.NodeOutgoingMessageHost;
}
