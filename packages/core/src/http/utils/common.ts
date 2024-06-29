/*
  This file contains code blocks from open source NodeJs project
  https://github.com/nodejs/
 */

const tokenRegExp = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/;
const nodeInternalPrefix = '__node_internal_';

/**
 * Verifies that the given val is a valid HTTP token
 * per the rules defined in RFC 7230
 * See https://tools.ietf.org/html/rfc7230#section-3.2.6
 *
 * https://github.com/nodejs/node/blob/main/lib/_http_common.js
 */
export function checkIsHttpToken(val: any) {
  return typeof val === 'string' && tokenRegExp.exec(val) !== null;
}

const headerCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

/**
 * True if val contains an invalid field-vchar
 *  field-value    = *( field-content / obs-fold )
 *  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 *  field-vchar    = VCHAR / obs-text
 *
 *  https://github.com/nodejs/node/blob/main/lib/_http_common.js
 */
function checkInvalidHeaderChar(val: string) {
  // noinspection SuspiciousTypeOfGuard
  return typeof val === 'string' && headerCharRegex.exec(val) !== null;
}

/**
 * This function removes unnecessary frames from Node.js core errors.
 *
 * https://github.com/nodejs/node/blob/main/lib/internal/errors.js
 */
export function hideStackFrames(fn: Function) {
  // We rename the functions that will be hidden to cut off the stacktrace
  // at the outermost one
  const hidden = nodeInternalPrefix + fn.name;
  // @ts-ignore
  Object.defineProperty(fn, 'name', { __proto__: null, value: hidden });
  return fn;
}

export const validateHeaderName = hideStackFrames((name: string, label?: string) => {
  // noinspection SuspiciousTypeOfGuard
  if (typeof name !== 'string' || !name || !checkIsHttpToken(name)) {
    throw new TypeError(`${label || 'Header name'} must be a valid HTTP token ["${name}"]`);
  }
});

export const validateHeaderValue = hideStackFrames((name, value) => {
  if (value === undefined) {
    throw new TypeError(`Invalid value "${value}" for header "${name}"`);
  }
  if (checkInvalidHeaderChar(value)) {
    throw new TypeError(`Invalid character in header content ["${name}"]`);
  }
});

export function validateString(value: any, name?: string) {
  if (typeof value !== 'string') {
    throw new TypeError(`Invalid ${name ? name + ' ' : ''}argument. Value must be a string`);
  }
}
