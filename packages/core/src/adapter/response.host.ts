import type { HttpServerResponse } from './http/http-server-response';
import type { Response } from './response';

export namespace ResponseHost {
  export interface Initiator {
    value?: any;
    errors?: Error[];
    continueOnError?: boolean;
    count?: number;
    http?: HttpServerResponse;
  }
}

export class ResponseHost implements Response {
  value?: any;
  errors: Error[];
  continueOnError?: boolean;
  count?: number;
  http?: HttpServerResponse;

  constructor(init: ResponseHost.Initiator) {
    if (init)
      Object.assign(this, init);
    this.errors = this.errors || [];
  }

  switchToHttp(): HttpServerResponse {
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
