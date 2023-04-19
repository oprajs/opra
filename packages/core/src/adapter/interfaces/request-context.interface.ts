import { ApiDocument, HttpRequestMessage, HttpResponseMessage } from '@opra/common';
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

  switchToHttp(): HttpRequestContext;

  switchToWs(): WsRequestContext;

  switchToRpc(): RpcRequestContext;

  // on(event: 'finish', fn: (args: RequestContext.OnFinishArgs) => void | Promise<void>);
}


export interface HttpRequestContext extends Omit<RequestContext, 'request' | 'response'> {

  readonly request: HttpRequestMessage;

  readonly response: HttpResponseMessage;
}


export interface WsRequestContext extends Omit<RequestContext, 'request' | 'response'> {

}


export interface RpcRequestContext extends Omit<RequestContext, 'request' | 'response'> {

}
