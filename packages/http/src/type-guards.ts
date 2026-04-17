import { isReadable, isStream } from '@opra/common';
import type { HttpIncoming } from './interfaces/http-incoming.interface.js';
import type { HttpOutgoing } from './interfaces/http-outgoing.interface.js';
import type { NodeIncomingMessage } from './interfaces/node-incoming-message.interface.js';
import type { NodeOutgoingMessage } from './interfaces/node-outgoing-message.interface.js';

/**
 * Checks if the given value is a NodeIncomingMessage.
 *
 * @param v - The value to check.
 * @returns True if the value is a NodeIncomingMessage, false otherwise.
 */
export function isNodeIncomingMessage(v: any): v is NodeIncomingMessage {
  return (
    v &&
    typeof v.method === 'string' &&
    Array.isArray(v.rawHeaders) &&
    isReadable(v)
  );
}

/**
 * Checks if the given value is an HttpIncoming instance.
 *
 * @param v - The value to check.
 * @returns True if the value is an HttpIncoming instance, false otherwise.
 */
export function isHttpIncoming(v: any): v is HttpIncoming {
  return (
    (isNodeIncomingMessage(v) as any) &&
    typeof v.header === 'function' &&
    typeof v.acceptsLanguages === 'function' &&
    typeof v.readBody === 'function'
  );
}

/**
 * Checks if the given value is a NodeOutgoingMessage.
 *
 * @param v - The value to check.
 * @returns True if the value is a NodeOutgoingMessage, false otherwise.
 */
export function isNodeOutgoingMessage(v: any): v is NodeOutgoingMessage {
  return v && typeof v.getHeaders === 'function' && isStream(v);
}

/**
 * Checks if the given value is an HttpOutgoing instance.
 *
 * @param v - The value to check.
 * @returns True if the value is an HttpOutgoing instance, false otherwise.
 */
export function isHttpOutgoing(v: any): v is HttpOutgoing {
  return (
    (isNodeOutgoingMessage(v) as any) &&
    typeof v.clearCookie === 'function' &&
    typeof v.cookie === 'function'
  );
}
