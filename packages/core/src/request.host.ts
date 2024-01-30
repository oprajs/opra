import type { PartialSome, StrictOmit } from 'ts-gems';
import type { Resource } from '@opra/common';
import { ApiAction, ApiOperation } from '@opra/common';
import type { HttpServerRequest } from './http/http-server-request.js';
import type { Request } from './request.js';

export namespace RequestHost {
  export interface Initiator extends PartialSome<
      StrictOmit<Request, 'resource' | 'switchToHttp' | 'switchToWs' | 'switchToRpc'>,
      'params'> {
    controller: Object;
    handler: Function;
    http?: HttpServerRequest;

    [key: string]: any;
  }
}

export interface RequestHost extends Request {
}

export class RequestHost implements Request {
  controller: any;
  endpoint: ApiAction | ApiOperation;
  http?: HttpServerRequest;
  key?: any;
  params: Record<string, any>;

  constructor(init: RequestHost.Initiator) {
    Object.assign(this, init);
    this.params = this.params || {};
  }

  get resource(): Resource {
    return this.endpoint.resource;
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
