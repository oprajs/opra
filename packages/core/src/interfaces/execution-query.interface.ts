import type { DataType } from '../implementation/data-type/data-type.js';
import type { OpraService } from '../implementation/opra-service';
import type { OperationKind } from '../types.js';

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
