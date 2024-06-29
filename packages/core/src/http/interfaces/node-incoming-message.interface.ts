import { HeaderInfo, HTTPParser } from '@browsery/http-parser';
import { isAsyncIterable, isIterable } from '@opra/common';
import http from 'http';
import { Readable } from 'stream';
import { CRLF, kHttpParser, NodeIncomingMessageHost } from '../impl/node-incoming-message.host.js';
import { concatReadable } from '../utils/concat-readable.js';

/**
 * @interface NodeIncomingMessage
 */
export interface NodeIncomingMessage
  extends Readable,
    Pick<
      http.IncomingMessage,
      | 'httpVersion'
      | 'httpVersionMajor'
      | 'httpVersionMinor'
      | 'complete'
      | 'headers'
      | 'trailers'
      | 'rawHeaders'
      | 'rawTrailers'
      | 'method'
      | 'url'
    > {}

/**
 *
 * @namespace NodeIncomingMessage
 */
export namespace NodeIncomingMessage {
  export interface Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    method?: string;
    url?: string;
    headers?: Record<string, any> | string[];
    trailers?: Record<string, any> | string[];
    params?: Record<string, any>;
    cookies?: Record<string, any>;
    body?: any;
    ip?: string;
    ips?: string[];
  }

  /**
   * Creates a new NodeIncomingMessage from given argument
   * @param iterable
   */
  export function from(iterable: string | Iterable<any> | AsyncIterable<any> | Initiator): NodeIncomingMessage {
    if (typeof iterable === 'object' && !(isIterable(iterable) || isAsyncIterable(iterable))) {
      return new NodeIncomingMessageHost(iterable as Initiator);
    }
    const msg = new NodeIncomingMessageHost();
    const parser = (msg[kHttpParser] = new HTTPParser(HTTPParser.REQUEST));
    let bodyChunks: Buffer[] | undefined;
    parser[HTTPParser.kOnHeadersComplete] = (info: HeaderInfo) => {
      msg.httpVersionMajor = info.versionMajor;
      msg.httpVersionMinor = info.versionMinor;
      msg.rawHeaders = info.headers;
      msg.method = HTTPParser.methods[info.method];
      msg.url = info.url;
      msg.emit('headers');
    };
    parser[HTTPParser.kOnHeaders] = (trailers: string[]) => {
      msg.rawTrailers = trailers;
    };
    parser[HTTPParser.kOnBody] = (chunk: Buffer, offset: number, length: number) => {
      bodyChunks = bodyChunks || [];
      bodyChunks.push(chunk.subarray(offset, offset + length));
    };
    const readable = concatReadable(Readable.from(iterable as any), Readable.from(CRLF));
    msg.once('finish', () => {
      parser.finish();
      msg.complete = true;
      if (bodyChunks) msg.body = Buffer.concat(bodyChunks);
    });
    readable.pipe(msg);
    return msg;
  }

  /**
   * Creates a new NodeIncomingMessage from given argument
   * @param iterable
   */
  export async function fromAsync(
    iterable: string | Iterable<any> | AsyncIterable<any> | Initiator,
  ): Promise<NodeIncomingMessage> {
    return new Promise<NodeIncomingMessage>((resolve, reject) => {
      const msg = from(iterable);
      msg.once('finish', () => resolve(msg));
      msg.once('error', error => reject(error));
    });
  }
}
