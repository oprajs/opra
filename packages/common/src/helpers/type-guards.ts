/// <reference lib="dom" />
import { Readable } from 'stream';
import { Type } from 'ts-gems';

export function isConstructor(fn: any): fn is Type {
  return typeof fn === 'function' && fn.prototype &&
      fn.prototype.constructor === fn &&
      fn.prototype.constructor.name !== 'Function' &&
      fn.prototype.constructor.name !== 'embedded';
}

export function isStream(stream) {
  return stream !== null
      && typeof stream === 'object'
      && typeof stream.pipe === 'function';
}

export function isReadable(x): x is Readable {
  return isStream(x)
      && typeof x._read === 'function'
      && typeof x._readableState === 'object';
}

export function isWritable(x): x is Readable {
  return isStream(x)
      && typeof x._write === 'function';
}

export function isReadableStream(x): x is ReadableStream {
  return isStream(x)
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

export function isURL(x: any): x is URL {
  return x !== null
      && typeof x == 'object'
      && typeof x.host === 'string'
      && typeof x.href === 'string';
}

export function isIterable<T = unknown>(x: any): x is Iterable<T> {
  return Symbol.iterator in x;
}

export function isAsyncIterable<T = unknown>(x: any): x is AsyncIterableIterator<T> {
  return Symbol.asyncIterator in x;
}
