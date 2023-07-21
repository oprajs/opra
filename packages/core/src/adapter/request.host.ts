import type { Resource } from '@opra/common';
import { OpraSchema } from '@opra/common';
import { HttpServerRequest } from './http/impl/http-server-request.js';
import type { Request } from './interfaces/request.interface.js';

export namespace RequestHost {
  export interface Initiator {
    contentId?: string;
    kind: string;
    resource: Resource;
    operation: string;
    crud: 'create' | 'read' | 'update' | 'delete';
    many: boolean;
    args: any;
    http?: HttpServerRequest;
  }
}

export class RequestHost implements Request {
  readonly contentId: string = '';
  readonly kind: string;
  readonly resource: Resource;
  readonly resourceKind: OpraSchema.Resource.Kind;
  readonly operation: string;
  readonly crud: 'create' | 'read' | 'update' | 'delete';
  readonly many: boolean;
  readonly args: any;
  readonly http?: HttpServerRequest;

  constructor(init: RequestHost.Initiator) {
    Object.assign(this, init);
    this.resourceKind = this.resource.kind;
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
