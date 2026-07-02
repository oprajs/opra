import { Blob } from 'node:buffer';
import http from 'node:http';
import { Writable } from 'node:stream';
import web from 'node:stream/web';
import { type HeaderInfo, HTTPParser } from '@browsery/http-parser';
import { isPlainObject } from '@jsopen/objects';
import { WriteStream as Capacitor } from 'fs-capacitor';
import { toReadable } from '../utils/to-readeble.js';

/**
 * Extended http.ServerResponse that buffers output into a capacitor.
 * Allows reading the full raw HTTP response (status line + headers + body)
 * via `capacitor.createReadStream()` after the response is finished.
 */
export interface ServerResponseHost extends http.ServerResponse {
  readonly capacitor: Capacitor;
  complete?: boolean;
}

const CRLF = Buffer.from('\r\n');

export namespace ServerResponseHost {
  export interface Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    headers?: Record<string, any> | Headers | Map<string, any> | string[];
    trailers?: Record<string, any> | Headers | Map<string, any> | string[];
    statusCode?: number;
    statusMessage?: string;
    chunkedEncoding?: boolean;
    sendDate?: boolean;
    strictContentLength?: boolean;
    parsedUrl?: URL;
  }

  /**
   * Creates a virtual ServerResponseHost synchronously from an Initiator.
   * Status, headers and body are stored on the object — nothing is written
   * to the socket yet. The caller is responsible for serializing the response
   * (e.g. as raw HTTP or multipart form-data) and calling `res.end()` when done.
   */
  export function create(
    req: http.IncomingMessage,
    init?: Initiator,
  ): ServerResponseHost {
    const res = createServerResponseBase(req);
    if (init?.statusCode) res.statusCode = init.statusCode;
    if (init?.statusMessage) res.statusMessage = init.statusMessage;
    if (init?.chunkedEncoding != null)
      res.chunkedEncoding = init.chunkedEncoding;
    if (init?.sendDate != null) res.sendDate = init.sendDate;
    if (init?.strictContentLength != null)
      res.strictContentLength = init.strictContentLength;
    if (init?.headers) {
      for (const [key, value] of iterateHeaders(init.headers)) {
        res.setHeader(key, value);
      }
    }
    return res;
  }

  /**
   * Creates a virtual ServerResponseHost from any input.
   * - Initiator (or no init): synchronous, delegates to `create`.
   * - Raw HTTP response bytes/stream: parsed via HTTPParser, resolves when
   *   headers are complete (body continues streaming in the background).
   */
  export async function from(
    req: http.IncomingMessage,
    init?:
      | Initiator
      | string
      | NodeJS.ReadableStream
      | NodeJS.WritableStream
      | Blob
      | Iterable<any>
      | AsyncIterable<any>
      | ((source: AsyncIterable<any>) => AsyncIterable<any>)
      | ((source: AsyncIterable<any>) => Promise<void>)
      | Promise<any>
      | web.ReadableWritablePair
      | web.ReadableStream
      | web.WritableStream,
    options?: { waitForBody?: boolean },
  ): Promise<ServerResponseHost> {
    if (!init || isPlainObject(init))
      return create(req, init as Initiator | undefined);

    return new Promise<ServerResponseHost>((resolve, reject) => {
      const res = createServerResponseBase(req);
      const parser = new HTTPParser(HTTPParser.RESPONSE);

      parser[HTTPParser.kOnHeadersComplete] = (info: HeaderInfo) => {
        res.statusCode = info.statusCode ?? 200;
        res.statusMessage = info.statusMessage ?? '';
        const rawHeaders = info.headers;
        for (let i = 0; i < rawHeaders.length - 1; i += 2) {
          res.setHeader(rawHeaders[i], rawHeaders[i + 1]);
        }
        if (!options?.waitForBody) resolve(res);
      };

      parser[HTTPParser.kOnHeaders] = (trailers: string[]) => {
        res.addTrailers(
          trailers.reduce<Record<string, string>>((acc, v, i, arr) => {
            if (i % 2 === 0) acc[v] = arr[i + 1];
            return acc;
          }, {}),
        );
      };

      parser[HTTPParser.kOnBody] = (
        _chunk: Buffer | string,
        offset: number,
        length: number,
      ) => {
        const buf = Buffer.isBuffer(_chunk)
          ? _chunk
          : Buffer.from(String(_chunk));
        res.write(
          offset || length !== buf.length
            ? buf.subarray(offset, offset + length)
            : buf,
        );
      };

      parser[HTTPParser.kOnMessageComplete] = () => {
        res.end();
      };

      const readable = toReadable(init as any);
      readable.on('data', (chunk: Buffer | string) => {
        try {
          parser.execute(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        } catch (err) {
          reject(err);
          res.emit('error', err);
        }
      });
      readable.on('end', () => {
        try {
          // Feed a trailing CRLF pair before finishing — helps the parser
          // reach kOnMessageComplete when the source lacks the final CRLF
          // (common with multipart parts that strip the boundary newline).
          if (!res.complete) parser.execute(CRLF);
          parser.finish();
          if (!res.complete) {
            res.complete = true;
            res.emit('complete');
            resolve(res);
          }
        } catch (err) {
          reject(err);
          res.emit('error', err);
        }
      });
      readable.on('error', (err: Error) => {
        reject(err);
        res.emit('error', err);
      });
    });
  }
}

/**
 * Creates the base http.ServerResponse backed by a capacitor-draining fake socket.
 */
function createServerResponseBase(
  req: http.IncomingMessage,
): ServerResponseHost {
  const capacitor = new Capacitor();
  const fakeSocket = new Writable({
    write(chunk, encoding, callback) {
      capacitor.write(chunk, encoding, callback);
    },
    final(callback) {
      capacitor.end(callback);
    },
  }) as any;

  fakeSocket.remoteAddress = '::1';
  fakeSocket.remoteFamily = 'IPv6';
  fakeSocket.remotePort = 0;
  fakeSocket.encrypted = false;
  fakeSocket.readable = true;
  fakeSocket.writable = true;
  fakeSocket.allowHalfOpen = true;

  const res = new http.ServerResponse(req);
  res.assignSocket(fakeSocket);
  Object.defineProperty(res, 'capacitor', {
    value: capacitor,
    enumerable: false,
  });
  res.once('finish', () => {
    if (!capacitor.destroyed) capacitor.end();
  });

  return res as ServerResponseHost;
}

/**
 * Iterates header entries from any supported header format.
 */
function* iterateHeaders(
  headers: Record<string, any> | Headers | Map<string, any> | string[],
): Iterable<[string, any]> {
  if (Array.isArray(headers)) {
    for (let i = 0; i < headers.length - 1; i += 2)
      yield [headers[i], headers[i + 1]];
  } else if (headers instanceof Map || headers instanceof Headers) {
    yield* (headers as Map<string, any>).entries();
  } else {
    yield* Object.entries(headers);
  }
}
