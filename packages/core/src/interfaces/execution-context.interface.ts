import type { ExecutionQuery } from '../implementation/execution-query';
import type { OpraService } from '../implementation/opra-service';

export interface ExecutionContext {
  readonly service: OpraService;
  readonly query: ExecutionQuery;
  readonly returnPath?: string;
  response: any;
  userContext?: any;
  errors?: any[];
}
