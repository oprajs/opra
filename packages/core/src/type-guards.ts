import { isReadable, isStream } from '@opra/common';
import type { HttpIncoming } from './http/interfaces/http-incoming.interface.js';
import type { HttpOutgoing } from './http/interfaces/http-outgoing.interface.js';
import type { NodeIncomingMessage } from './http/interfaces/node-incoming-message.interface.js';
import type { NodeOutgoingMessage } from './http/interfaces/node-outgoing-message.interface.js';

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
