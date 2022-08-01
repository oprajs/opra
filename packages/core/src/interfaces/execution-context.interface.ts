import { ExecutionQuery } from './execution-query.interface';
import { OpraService } from './opra-service.interface';

export interface ExecutionContext {
  readonly service: OpraService;
  readonly query: ExecutionQuery;
  readonly returnPath?: string;
  response: any;
  userContext?: any;
  errors?: any[];
}
