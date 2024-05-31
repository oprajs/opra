import 'reflect-metadata';
import './augmentation/18n.augmentation.js';
import './augmentation/http-controller.augmentation.js';
import * as ExecutionContextHost_ from './server/base/execution-context.host.js';
import * as PlatformAdapterHost_ from './server/base/platform-adapter.host.js';
import * as ExpressAdapterHost_ from './server/http/adapters/express-adapter.host.js';
import * as HttpAdapterHost_ from './server/http/http-adapter-host.js';
import * as HttpContextHost_ from './server/http/http-context.host.js';
import * as HttpIncomingHost_ from './server/http/http-incoming.host.js';
import * as HttpOutgoingHost_ from './server/http/http-outgoing.host.js';
import * as NodeIncomingMessageHost_ from './server/http/node-incoming-message.host.js';
import * as NodeOutgoingMessageHost_ from './server/http/node-outgoing-message.host.js';

export * from './helpers/logger.js';
export * from './helpers/service-base.js';

export * from './server/base/execution-context.host.js';
export * from './server/base/interfaces/execution-context.interface.js';
export * from './server/base/interfaces/logger.interface.js';
export * from './server/base/interfaces/platform-adapter.interface.js';

export * from './server/http/adapters/express-adapter.js';
export * from './server/http/interfaces/http-adapter.interface.js';
export * from './server/http/interfaces/http-context.interface.js';
export * from './server/http/interfaces/http-incoming.interface.js';
export * from './server/http/interfaces/http-outgoing.interface.js';
export * from './server/http/interfaces/node-incoming-message.interface.js';
export * from './server/http/interfaces/node-outgoing-message.interface.js';
export * from './server/http/multipart-reader.js';

export * from './type-guards.js';

export namespace classes {
  export import ExecutionContextHost = ExecutionContextHost_.ExecutionContextHost;
  export import PlatformAdapterHost = PlatformAdapterHost_.PlatformAdapterHost;
  export import HttpAdapterHost = HttpAdapterHost_.HttpAdapterHost;
  export import HttpContextHost = HttpContextHost_.HttpContextHost;
  export import HttpIncomingHost = HttpIncomingHost_.HttpIncomingHost;
  export import HttpOutgoingHost = HttpOutgoingHost_.HttpOutgoingHost;
  export import NodeIncomingMessageHost = NodeIncomingMessageHost_.NodeIncomingMessageHost;
  export import NodeOutgoingMessageHost = NodeOutgoingMessageHost_.NodeOutgoingMessageHost;
  export import ExpressAdapterHost = ExpressAdapterHost_.ExpressAdapterHost;
}
