import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ExecutionContext,
  HttpExecutionContext,
  RpcExecutionContext,
  WsExecutionContext
} from './interfaces/execution-context.interface.js';
import { Request } from './interfaces/request.interface.js';
import { Response } from './interfaces/response.interface.js';

export abstract class ExecutionContextHost extends AsyncEventEmitter implements ExecutionContext {
  user?: any;

  protected constructor(
      readonly protocol: ExecutionContext.Protocol,
      readonly platform: string,
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

  switchToHttp(): HttpExecutionContext {
    throw new TypeError('Not executing in an "Http" protocol');
  }

  switchToWs(): WsExecutionContext {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): RpcExecutionContext {
    throw new TypeError('Not executing in an "RPC" protocol');
  }

}
