import { ApiDocument } from '@opra/common';
import { Request } from '../interfaces/request.interface.js';
import {
  HttpRequestContext,
  RpcRequestContext,
  WsRequestContext
} from '../interfaces/request-context.interface.js';
import { Response } from '../interfaces/response.interface.js';
import { RequestContextHost } from '../request-context.host.js';

export class HttpRequestContextHost extends RequestContextHost {
  user?: any;

  constructor(
      readonly platform: string,
      readonly api: ApiDocument,
      protected _request: Request,
      protected _response: Response,
  ) {
    super('http', platform, api, _request, _response);
  }

  switchToHttp(): HttpRequestContext {
    const obj = {
      request: this._request.switchToHttp(),
      response: this._response.switchToHttp()
    };
    Object.setPrototypeOf(obj, this);
    return obj as HttpRequestContext;
  }

  switchToWs(): WsRequestContext {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): RpcRequestContext {
    throw new TypeError('Not executing in an "RPC" protocol');
  }

}
