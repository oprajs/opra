import type { Writable } from 'ts-gems';
import type { Expression } from '@opra/url';
import type { OperationKind } from '../types';
import type { DataType } from './data-type/data-type';
import type { OpraService } from './opra-service';
import type { Resource } from './resource/resource';

export type ExecutionQueryArgs = Writable<ExecutionQuery>

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
