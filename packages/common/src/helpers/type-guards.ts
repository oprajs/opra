/// <reference lib="dom" />
import { Readable } from 'stream';
import { Type } from 'ts-gems';

export function isConstructor(fn: any): fn is Type {
  return typeof fn === 'function' && fn.prototype &&
      fn.prototype.constructor === fn &&
      fn.prototype.constructor.name !== 'Function' &&
      fn.prototype.constructor.name !== 'anonymous';
}

export function isStream(stream) {
  return stream !== null
      && typeof stream === 'object'
      && typeof stream.pipe === 'function';
}

export function isReadable(x): x is Readable {
  return isStream(x)
      && x.readable !== false
      && typeof x._read === 'function'
      && typeof x._readableState === 'object';
}

export function isReadableStream(x): x is ReadableStream {
  return isStream(x)
      && x.readable !== false
      && typeof x.getReader === 'function'
      && typeof x.pipeThrough === 'function'
      && typeof x.pipeTo === 'function';
}

export function isBlob(x): x is Blob {
  return x !== null
      && typeof x === 'object'
      && typeof x.size === 'number'
      && typeof x.arrayBuffer === 'function'
      && typeof x.stream === 'function';
}

export function isFormData(x): x is FormData {
  return x !== null
      && typeof x.constructor === 'function'
      && x.constructor.name === 'FormData'
      && typeof x.append === 'function'
      && typeof x.getAll === 'function';
}

export function isURL(x): x is URL {
  return x !== null
      && typeof x == 'object'
      && typeof x.host === 'string'
      && typeof x.href === 'string';
}
