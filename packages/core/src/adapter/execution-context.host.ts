import { AsyncEventEmitter } from 'strict-typed-events';
import type { ApiDocument } from '@opra/common';
import type { HttpServerResponse } from './/http/http-server-response.js';
import type {
  ExecutionContext,
  HttpMessageContext,
  RpcMessageContext,
  WsMessageContext
} from './execution-context.js';
import type { HttpServerRequest } from './http/http-server-request.js';
import { Protocol } from './platform-adapter.js';

export class ExecutionContextHost extends AsyncEventEmitter implements ExecutionContext {
  readonly protocol: Protocol;
  readonly http?: HttpMessageContext;
  readonly ws?: WsMessageContext;
  readonly rpc?: RpcMessageContext;
  errors: Error[] = [];
  executionScope: Record<string | number | symbol, any> = {};

  constructor(
      readonly api: ApiDocument,
      readonly platform: string,
      protocol: {
        http?: {
          incoming: HttpServerRequest;
          outgoing: HttpServerResponse;
        };
        ws?: WsMessageContext;
        rpc?: RpcMessageContext;
      },
  ) {
    super();
    this.ws = protocol.ws;
    this.rpc = protocol.rpc;
    if (protocol.http) {
      this.protocol = 'http';
      this.http = {
        platform,
        incoming: protocol.http.incoming,
        outgoing: protocol.http.outgoing,
        switchToContext: () => this
      };
    } else if (protocol.ws) {
      this.protocol = 'ws';
      this.ws = protocol.ws;
    } else if (protocol.rpc) {
      this.protocol = 'rpc';
      this.rpc = protocol.rpc;
    }
  }

  switchToHttp(): HttpMessageContext {
    if (this.http)
      return this.http
    throw new TypeError('Not executing in an "Http" context');
  }

  switchToWs(): WsMessageContext {
    if (this.ws)
      return this.ws
    throw new TypeError('Not executing in an "WebSocket" context');
  }

  switchToRpc(): RpcMessageContext {
    if (this.rpc)
      return this.rpc
    throw new TypeError('Not executing in an "RPC" context');
  }

}
