import { ApiDocument } from '@opra/common';
import { HttpServerRequest } from '../http/impl/http-server-request.js';
import { HttpServerResponse } from '../http/impl/http-server-response.js';
import { Request } from './request.interface.js';
import { Response } from './response.interface.js';

export namespace RequestContext {
  export type Protocol = 'http' | 'ws' | 'rpc';
  // export type OnFinishArgs = {
  //   context: RequestContext;
  //   failed: boolean;
  // }
}

export interface RequestContext {

  readonly protocol: RequestContext.Protocol;

  readonly platform: string;

  readonly api: ApiDocument;

  readonly request: Request;

  readonly response: Response;

  user?: any;

  switchToHttp(): HttpMessageContext;

  switchToWs(): WsMessageContext;

  switchToRpc(): RpcMessageContext;

  // on(event: 'finish', fn: (args: RequestContext.OnFinishArgs) => void | Promise<void>);
}


export interface HttpMessageContext {
  readonly platform: string;
  readonly request: HttpServerRequest;
  readonly response: HttpServerResponse;

  switchToContext(): RequestContext;
}

export interface WsMessageContext {
  switchToContext(): RequestContext;
}

export interface RpcMessageContext {
  switchToContext(): RequestContext;
}
