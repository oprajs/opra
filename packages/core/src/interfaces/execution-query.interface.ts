import { DataType } from '../implementation/data-type/data-type.js';
import { OperationKind } from '../types.js';
import { OpraService } from './opra-service.interface';

export interface ExecutionQuery {
  readonly service: OpraService;
  readonly operation: OperationKind;
  readonly resource: string;
  readonly key?: any;
  readonly path?: string;
  readonly resultType?: DataType;
  readonly elements?: Record<string, ExecutionQuery | boolean>;
  readonly expose?: boolean;

  isPropertyExposed(propertyName: string): boolean;
}
