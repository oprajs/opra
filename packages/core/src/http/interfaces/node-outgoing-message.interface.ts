import http, { OutgoingHttpHeaders } from 'http';
import { Writable } from 'stream';
import { NodeOutgoingMessageHost } from '../impl/node-outgoing-message.host.js';
import { NodeIncomingMessage } from './node-incoming-message.interface.js';

export interface NodeOutgoingMessage
  extends Writable,
    Pick<
      http.ServerResponse,
      | 'addTrailers'
      | 'getHeader'
      | 'getHeaders'
      | 'getHeaderNames'
      | 'flushHeaders'
      | 'removeHeader'
      | 'hasHeader'
      | 'headersSent'
      | 'statusCode'
      | 'statusMessage'
      | 'sendDate'
    > {
  req: NodeIncomingMessage;

  getRawHeaderNames(): string[];

  appendHeader(name: string, value: string | readonly string[]): this;

  setHeader(name: string, value: number | string | readonly string[]): this;
}

/**
 *
 * @namespace NodeOutgoingMessage
 */
export namespace NodeOutgoingMessage {
  export interface Initiator {
    req: NodeIncomingMessage;
    statusCode?: number;
    statusMessage?: string;
    headers?: OutgoingHttpHeaders | Headers | Map<string, any> | string[];
    chunkedEncoding?: boolean;
    sendDate?: boolean;
    strictContentLength?: boolean;
    body?: string | Iterable<any> | AsyncIterable<any> | Object;
    parsedUrl?: URL;
  }

  export function from(init: Initiator): NodeOutgoingMessage {
    return new NodeOutgoingMessageHost(init);
  }
}
