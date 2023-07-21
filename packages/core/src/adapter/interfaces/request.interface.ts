import { OpraSchema, Resource } from '@opra/common';
import { HttpServerRequest } from '../http/impl/http-server-request.js';

export interface Request {
  readonly contentId: string;
  readonly kind: string;
  readonly resource: Resource;
  readonly resourceKind: OpraSchema.Resource.Kind;
  readonly operation: string;
  readonly crud: 'create' | 'read' | 'update' | 'delete';
  readonly many: boolean;
  readonly args: any;

  switchToHttp(): HttpServerRequest;

  switchToWs(): never;

  switchToRpc(): never;
}
