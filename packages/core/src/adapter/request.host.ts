import type { StrictOmit } from 'ts-gems';
import type { HttpServerRequest } from './http/http-server-request.js';
import type { Request } from './request';

export namespace RequestHost {
  export interface Initiator extends StrictOmit<Request, 'switchToHttp' | 'switchToWs' | 'switchToRpc'> {
    controller: any;
    http?: HttpServerRequest;

    [key: string]: any;
  }
}

export interface RequestHost extends Request {
}

export class RequestHost implements Request {
  controller: any;
  http?: HttpServerRequest;
  key?: any;
  params: Record<string, any>;

  constructor(init: RequestHost.Initiator) {
    Object.assign(this, init);
    this.params = this.params || {};
  }

  switchToHttp(): HttpServerRequest {
    if (this.http)
      return this.http;
    throw new TypeError('Not executing in an "Http" context');
  }

  switchToWs(): never {
    throw new TypeError('Not executing in an "WebSocket" context');
  }

  switchToRpc(): never {
    throw new TypeError('Not executing in an "RPC" context');
  }

}
