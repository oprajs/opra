import type { Resource } from '@opra/common';
import { OpraSchema } from '@opra/common';
import { HttpRequestMessage } from './http/http-request-message.js';
import type { Request } from './interfaces/request.interface.js';

export namespace RequestHost {
  export interface Initiator {
    kind: string;
    resource: Resource;
    operation: string;
    crud: 'create' | 'read' | 'update' | 'delete';
    many: boolean;
    args: any;
  }
}

export abstract class RequestHost implements Request {
  readonly kind: string;
  readonly resource: Resource;
  readonly resourceKind: OpraSchema.Resource.Kind;
  readonly operation: string;
  readonly crud: 'create' | 'read' | 'update' | 'delete';
  readonly many: boolean;
  readonly args: any;

  protected constructor(init: RequestHost.Initiator) {
    Object.assign(this, init);
    this.resourceKind = this.resource.kind;
  }

  switchToHttp(): HttpRequestMessage {
    throw new TypeError('Not executing in an "Http" protocol');
  }

  switchToWs(): never {
    throw new TypeError('Not executing in an "WebSocket" protocol');
  }

  switchToRpc(): never {
    throw new TypeError('Not executing in an "RPC" protocol');
  }

}
