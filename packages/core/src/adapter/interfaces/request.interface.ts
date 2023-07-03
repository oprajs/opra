import { OpraSchema, Resource } from '@opra/common';
import type { HttpRequestMessage } from '../http/http-request-message.js';

export interface Request {
  readonly kind: string;
  readonly resource: Resource;
  readonly resourceKind: OpraSchema.Resource.Kind;
  readonly operation: string;
  readonly crud: 'create' | 'read' | 'update' | 'delete';
  readonly many: boolean;
  readonly args: any;

  switchToHttp(): HttpRequestMessage;

  switchToWs(): never;

  switchToRpc(): never;
}
