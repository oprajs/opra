import { ApiException } from '@opra/common';
import { Type } from 'ts-gems';

export interface ExecutionContext {
  errors?: ApiException[];
}

export type AnyPathNode = CollectionPathNode;

export interface PathNode {
  parent?: PathNode;
  resolverType: any;
  properties?: Record<string, AnyPathNode>;
}

export interface CollectionPathNode extends PathNode {
  resource: string;
}

export interface InstancePathNode extends PathNode {
  resource: string;
  keyValue: any;
}
