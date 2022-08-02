import type { Writable } from 'ts-gems';
import type { ExecutionContext } from '../interfaces/execution-context.interface';
import type { ExecutionQuery } from '../interfaces/execution-query.interface';
import type { OpraService } from './opra-service';

export type ExecutionContextArgs = Writable<ExecutionContext>;

export class ExecutionContextHost implements ExecutionContext {
  readonly service: OpraService;
  readonly query: ExecutionQuery;
  readonly returnPath?: string;
  response: any;
  userContext?: any;
  errors?: any[];

  constructor(args: ExecutionContextArgs) {
    Object.assign(this, args);
  }

}
