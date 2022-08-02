import type { OpraService } from '../implementation/opra-service';
import type { ExecutionQuery } from './execution-query.interface';

export interface ExecutionContext {
  readonly service: OpraService;
  readonly query: ExecutionQuery;
  readonly returnPath?: string;
  response: any;
  userContext?: any;
  errors?: any[];
}
