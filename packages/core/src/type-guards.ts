import { isReadable, isStream } from '@opra/common';
import { ExecutionContextHost } from './server/base/execution-context.host.js';
import type { ExecutionContext } from './server/base/interfaces/execution-context.interface';
import type { HttpIncoming } from './server/http/interfaces/http-incoming.interface.js';
import type { HttpOutgoing } from './server/http/interfaces/http-outgoing.interface.js';
import type { NodeIncomingMessage } from './server/http/interfaces/node-incoming-message.interface.js';
import type { NodeOutgoingMessage } from './server/http/interfaces/node-outgoing-message.interface.js';

export function isExecutionContext(v: any): v is ExecutionContext {
  return v instanceof ExecutionContextHost;
}

export function isNodeIncomingMessage(v: any): v is NodeIncomingMessage {
  return v && typeof v.method === 'string' && Array.isArray(v.rawHeaders) && isReadable(v);
}

export function isHttpIncoming(v: any): v is HttpIncoming {
  return (
    (isNodeIncomingMessage(v) as any) &&
    typeof v.header === 'function' &&
    typeof v.acceptsLanguages === 'function' &&
    typeof v.readBody === 'function'
  );
}

export function isNodeOutgoingMessage(v: any): v is NodeOutgoingMessage {
  return v && typeof v.getHeaders === 'function' && isStream(v);
}

export function isHttpOutgoing(v: any): v is HttpOutgoing {
  return (isNodeOutgoingMessage(v) as any) && typeof v.clearCookie === 'function' && typeof v.cookie === 'function';
}
