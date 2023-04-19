import { AsyncEventEmitter } from 'strict-typed-events';
import { ApiDocument } from '@opra/common';
import { Request } from './interfaces/request.interface.js';
import {
  HttpRequestContext,
  RequestContext,
  RpcRequestContext,
  WsRequestContext
} from './interfaces/request-context.interface.js';
import { Response } from './interfaces/response.interface.js';

export abstract class RequestContextHost extends AsyncEventEmitter implements RequestContext {
  user?: any;

  protected constructor(
      readonly protocol: RequestContext.Protocol,
      readonly platform: string,
      readonly api: ApiDocument,
      protected _request: Request,
      protected _response: Response
  ) {
    super();
  }

  get request(): Request {
    return this._request;
  }

  get response(): Response {
    return this._response;
  }

  switchToHttp(): HttpRequestContext {
    throw new TypeError('Not executing in an "Http" protocol');
  }

  switchToWs(): WsRequestContext {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): RpcRequestContext {
    throw new TypeError('Not executing in an "RPC" protocol');
  }

}
