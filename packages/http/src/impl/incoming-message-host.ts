import { Blob } from 'node:buffer';
import http, { type IncomingHttpHeaders } from 'node:http';
import { PassThrough } from 'node:stream';
import web from 'node:stream/web';
import { type HeaderInfo, HTTPParser } from '@browsery/http-parser';
import { isPlainObject } from '@jsopen/objects';
import { convertToHeaders } from '../utils/convert-to-headers.js';
import { convertToRawHeaders } from '../utils/convert-to-raw-headers.js';
import { toReadable } from '../utils/to-readeble.js';

const CRLF = Buffer.from('\r\n');

export namespace IncomingMessageHost {
  export interface Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    headers?: Record<string, any> | Headers | Map<string, any> | string[];
    trailers?: Record<string, any> | Headers | Map<string, any> | string[];
    body?: string | Iterable<any> | AsyncIterable<any> | Object;
    method?: string;
    url?: string;
    params?: Record<string, any>;
    cookies?: Record<string, any>;
    ip?: string;
    ips?: string[];
  }

  export function create(init?: Initiator): http.IncomingMessage {
    const req = createIncomingMessage();
    req.method = (init?.method || 'GET').toUpperCase();
    req.url = init?.url || '/';
    req.httpVersionMajor = init?.httpVersionMajor || 1;
    req.httpVersionMinor = init?.httpVersionMinor ?? 1;
    req.httpVersion = `${req.httpVersionMajor}.${req.httpVersionMinor}`;
    if (init?.headers) {
      if (Array.isArray(init.headers)) {
        req.rawHeaders = init.headers;
        req.headers = convertToHeaders(
          req.rawHeaders,
          {},
          { lowerCaseKeys: true },
        );
      } else {
        req.rawHeaders = convertToRawHeaders(init.headers);
        req.headers = convertToHeaders(
          req.rawHeaders,
          {},
          { lowerCaseKeys: true },
        );
      }
    }
    if (init?.trailers) {
      if (Array.isArray(init.trailers)) {
        req.rawTrailers = init.trailers;
        req.trailers = convertToHeaders(
          req.rawTrailers,
          {},
          { lowerCaseKeys: true },
        );
      } else {
        req.rawTrailers = convertToRawHeaders(init.trailers);
        req.trailers = convertToHeaders(
          req.rawTrailers,
          {},
          { lowerCaseKeys: true },
        );
      }
    }
    if (init?.params) (req as any).params = init.params;
    if (init?.cookies) (req as any).cookies = init.cookies;
    if (init?.ip) (req as any).ip = init.ip;
    if (init?.ips) (req as any).ips = init.ips;
    const body = init?.body;
    if (body != null) {
      if (Buffer.isBuffer(body)) req.push(body);
      else if (typeof body === 'string') req.push(Buffer.from(body, 'utf-8'));
      else req.push(Buffer.from(JSON.stringify(body), 'utf-8'));
    }
    req.push(null); // EOF
    req.complete = true;
    return req;
  }

  /**
   * Creates a new NodeIncomingMessage from the given argument
   * @param init
   * @param options
   */
  export async function from(
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
  ): Promise<http.IncomingMessage> {
    if (!init || isPlainObject(init))
      return create(init as Initiator | undefined);
    return new Promise<http.IncomingMessage>((resolve, reject) => {
      const req = createIncomingMessage();
      const parser = new HTTPParser(HTTPParser.REQUEST);
      parser[HTTPParser.kOnHeadersComplete] = (info: HeaderInfo) => {
        req.httpVersionMajor = info.versionMajor;
        req.httpVersionMinor = info.versionMinor;
        req.httpVersion = req.httpVersionMajor + '.' + req.httpVersionMinor;
        req.method = HTTPParser.methods[info.method];
        req.rawHeaders = info.headers;
        req.headers = convertToHeaders(
          info.headers,
          {},
          { lowerCaseKeys: true },
        ) as IncomingHttpHeaders;
        req.url = info.url;
        req.emit('headers');
        if (!options?.waitForBody) resolve(req);
      };
      parser[HTTPParser.kOnHeaders] = (trailers: string[]) => {
        req.rawTrailers = trailers;
        req.emit('trailers');
      };
      parser[HTTPParser.kOnBody] = (
        _chunk: Buffer | string,
        offset: number,
        length: number,
      ) => {
        const buf = Buffer.isBuffer(_chunk)
          ? _chunk
          : Buffer.from(String(_chunk));
        if (offset || length !== buf.length)
          req.push(buf.subarray(offset, offset + length));
        else req.push(buf);
      };

      parser[HTTPParser.kOnMessageComplete] = () => {
        // EOF must be pushed first so the stream signals end to consumers,
        // then complete is set — body is fully written to the stream at this point.
        req.push(null);
        req.complete = true;
        req.emit('complete');
        if (options?.waitForBody) resolve(req);
      };

      const readable = toReadable(init as any);
      readable.on('data', (chunk: Buffer | string) => {
        try {
          parser.execute(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        } catch (err) {
          reject(err);
          req.emit('error', err);
        }
      });
      readable.on('end', () => {
        try {
          // Feed a trailing CRLF before finishing — helps the parser reach
          // kOnMessageComplete when the source lacks the final CRLF
          // (common with multipart parts that strip the boundary newline).
          if (!req.complete) parser.execute(CRLF);
          parser.finish();
          // If kOnMessageComplete still hasn't fired (e.g. truncated body),
          // force-complete so the promise always resolves.
          if (!req.complete) {
            req.push(null);
            req.complete = true;
            req.emit('complete');
            resolve(req);
          }
        } catch (err) {
          reject(err);
          req.emit('error', err);
        }
      });
      readable.on('error', (err: Error) => {
        reject(err);
        req.emit('error', err);
      });
    });
  }
}

/**
 * Creates a real http.IncomingMessage from raw HTTP request bytes.
 *
 * Two modes:
 *  - Plain object (Initiator): sets properties directly without parsing.
 *  - Raw HTTP bytes (Buffer, string, stream, Blob, …): fed chunk-by-chunk to HTTPParser.
 *
 * Usage:
 *   const req = await createIncomingMessage(rawBuffer);
 *   // req is a real http.IncomingMessage, ready to pass to Express
 */
function createIncomingMessage(): http.IncomingMessage {
  // Fake socket — satisfies IncomingMessage internal requirements
  const fakeSocket = new PassThrough() as any;
  fakeSocket.remoteAddress = '127.0.0.1';
  fakeSocket.remoteFamily = 'IPv4';
  fakeSocket.remotePort = 0;
  fakeSocket.encrypted = false;
  fakeSocket.readable = true;
  fakeSocket.writable = true;
  return new http.IncomingMessage(fakeSocket);
}
