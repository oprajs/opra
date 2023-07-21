import { AsyncEventEmitter } from 'strict-typed-events';
import { ApiDocument } from '@opra/common';
import { Request } from './interfaces/request.interface.js';
import {
  HttpMessageContext,
  RequestContext,
  RpcMessageContext,
  WsMessageContext
} from './interfaces/request-context.interface.js';
import { Response } from './interfaces/response.interface.js';

export class RequestContextHost extends AsyncEventEmitter implements RequestContext {
  user?: any;
  protected _http?: HttpMessageContext;
  protected _ws?: WsMessageContext;
  protected _rpc?: RpcMessageContext;

  constructor(
      readonly protocol: RequestContext.Protocol,
      readonly platform: string,
      readonly api: ApiDocument,
      protected _request: Request,
      protected _response: Response
  ) {
    super();
    if (this.protocol === 'http') {
      this._http = {
        platform,
        request: this._request.switchToHttp(),
        response: this._response.switchToHttp(),
        switchToContext: () => this
      };
    }
  }

  get request(): Request {
    return this._request;
  }

  get response(): Response {
    return this._response;
  }

  switchToHttp(): HttpMessageContext {
    if (this._http)
      return this._http
    throw new TypeError('Not executing in an "Http" context');
  }

  switchToWs(): WsMessageContext {
    if (this._ws)
      return this._ws
    throw new TypeError('Not executing in an "WebSocket" context');
  }

  switchToRpc(): RpcMessageContext {
    if (this._rpc)
      return this._rpc
    throw new TypeError('Not executing in an "RPC" context');
  }

}
