import { ExecutionContextHost } from '../execution-context.host.js';
import {
  HttpExecutionContext,
  RpcExecutionContext,
  WsExecutionContext
} from '../interfaces/execution-context.interface.js';
import { Request } from '../interfaces/request.interface.js';
import { Response } from '../interfaces/response.interface.js';

export class HttpExecutionContextHost extends ExecutionContextHost {
  user?: any;

  constructor(
      readonly platform: string,
      protected _request: Request,
      protected _response: Response,
  ) {
    super('http', platform, _request, _response);
  }

  switchToHttp(): HttpExecutionContext {
    const obj = Object.create(this);
    obj.request = this._request.switchToHttp();
    obj.response = this._response.switchToHttp();
    return obj as HttpExecutionContext;
  }

  switchToWs(): WsExecutionContext {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): RpcExecutionContext {
    throw new TypeError('Not executing in an "RPC" protocol');
  }

}
