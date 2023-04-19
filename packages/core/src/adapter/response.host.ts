import { HttpResponseMessage } from '@opra/common';
import { Response } from './interfaces/response.interface.js';

export namespace ResponseHost {
  export interface Initiator {
    value?: any;
    errors?: Error[];
    continueOnError?: boolean;
    count?: number;
  }
}

export abstract class ResponseHost implements Response {
  value?: any;
  errors: Error[];
  continueOnError?: boolean;
  count?: number;

  protected constructor(init: ResponseHost.Initiator) {
    if (init)
      Object.assign(this, init);
    this.errors = this.errors || [];
  }

  switchToHttp(): HttpResponseMessage {
    throw new TypeError('Not executing in an "Http" protocol');
  }

  switchToWs(): never {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): never {
    throw new TypeError('Not executing in an "RPC" protocol');
  }
}
