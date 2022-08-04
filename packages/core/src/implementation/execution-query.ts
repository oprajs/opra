import type { StrictOmit, Writable } from 'ts-gems';
import type { Expression } from '@opra/url';
import type { OperationKind } from '../types';
import type { DataType } from './data-type/data-type';
import type { OpraService } from './opra-service';
import type { Resource } from './resource/resource';

export type ExecutionQueryArgs = Writable<ExecutionQuery>

export type ExecutionQueryProjection = Record<string, boolean | ExecutionQuery>;

export class ExecutionQuery {
  service: OpraService;
  operation: OperationKind;
  resource: Resource;
  keyValues?: any;
  path: string;
  fullPath: string;
  collection: boolean;
  resultType?: DataType;
  projection?: Record<string, boolean | ExecutionQuery>;
  nodes?: Record<string, ExecutionQuery>;
  filter?: Expression;
  sort?: string[];
  limit?: number;
  skip?: number;
  distinct?: boolean;
  total?: boolean;

  constructor(args: ExecutionQueryArgs) {
    Object.assign(this, args);
  }

}


/*

export interface OpraQuery {
  operation: OpraResourceOperationKind;
  path: string;
  fullPath: string;
  resource: OpraSchema.Resource;
  key?: any;
  type: OpraSchema.DataType;
  parentType?: OpraSchema.DataType;
  properties?: Record<string, boolean | OpraQuery>;
}



export interface OpraRequest {
  operation: OpraResourceOperationKind;
  path: string;
  fullPath: string;
  resourceName: string;
  key?: any;
//  returnType: Type;
//  returnModel?: OpraModel;
  // path?: string;
  elements?: Record<string, boolean>;
  filter?: Expression;
  sort?: string[];
  limit?: number;
  skip?: number;
}
*/
export interface OpraResponse {
  status?: number;
  value?: any;
  total?: number;
  etag?: string;
  headers?: Record<string, string>;
  // additional?: Record<string, any>;
}

/*
export interface OpraQueryNode {
  parent?: OpraQueryNode;
  operation: OpraQueryOperation;
  resourceName: string;
  keyValue?: string | number | Record<string, string | number>;
  returnType: Type;
  returnModel?: any;
  path?: string;
  projection?: Record<string, boolean>;
  filter?: Expression;
  sort?: string[];
  limit?: number;
  skip?: number;
  inputValue?: any;
  errors?: any[];
  response: {
    status?: number;
    value?: any;
    total?: number;
    etag?: string;
    headers?: Record<string, string>;
    additional?: Record<string, any>;
  }

}

export function isOpraQueryNode(v: any): v is OpraQueryNode {
  // noinspection SuspiciousTypeOfGuard
  return v && typeof v === 'object' &&
      typeof v.operation === 'string' &&
      typeof v.resourceName === 'string';
}
*/
