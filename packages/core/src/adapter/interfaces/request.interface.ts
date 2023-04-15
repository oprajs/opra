import { HttpRequestMessage, OpraSchema, Resource } from '@opra/common';

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
