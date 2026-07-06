import { isStream } from '@opra/common';
import http from 'http';
import type { HttpRequest } from './interfaces/http-request.interface.js';
import type { HttpResponse } from './interfaces/http-response.interface.js';

/**
 * Checks if the given value is a NodeIncomingMessage.
 *
 * @param v - The value to check.
 * @returns True if the value is a NodeIncomingMessage, false otherwise.
 */
export function isHttpIncomingMessage(v: any): v is http.IncomingMessage {
  return v instanceof http.IncomingMessage;
}

/**
 * Checks if the given value is an HttpRequest instance.
 *
 * @param v - The value to check.
 * @returns True if the value is an HttpRequest instance, false otherwise.
 */
export function isHttpRequest(v: any): v is HttpRequest {
  return (
    (isHttpIncomingMessage(v) as any) &&
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
export function isHttpOutgoingMessage(v: any): v is http.OutgoingMessage {
  return v && typeof v.getHeaders === 'function' && isStream(v);
}

/**
 * Checks if the given value is an HttpOutgoing instance.
 *
 * @param v - The value to check.
 * @returns True if the value is an HttpOutgoing instance, false otherwise.
 */
export function isHttpResponse(v: any): v is HttpResponse {
  return (
    (isHttpOutgoingMessage(v) as any) &&
    typeof v.clearCookie === 'function' &&
    typeof v.cookie === 'function'
  );
}
