import { StrictOmit, Writable } from 'ts-gems';
import { ExecutionQuery } from '../interfaces/execution-query.interface';
import type { OperationKind } from '../types';
import type { DataType } from './data-type/data-type';
import type { OpraServiceHost } from './service-host';

export type ExecutionQueryArgs = Writable<StrictOmit<ExecutionQuery, 'isPropertyExposed'>>

export class ExecutionQueryHost implements ExecutionQuery {
  service: OpraServiceHost;
  operation: OperationKind;
  resource: string;
  key?: any;
  path?: string;
  resultType?: DataType;
  elements?: Record<string, ExecutionQuery | boolean>;
  expose?: boolean;

  constructor(args: ExecutionQueryArgs) {
    Object.assign(this, args);
  }

  isPropertyExposed(propertyName: string): boolean {
    const prop = this.elements && this.elements[propertyName];
    if (typeof prop === 'object')
      return prop.expose === true || prop.expose == null;
    return !!prop || prop == null;
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
