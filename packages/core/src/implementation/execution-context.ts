import { Writable } from 'ts-gems';
import { ExecutionContext } from '../interfaces/execution-context.interface';
import { ExecutionQuery } from '../interfaces/execution-query.interface';
import { OpraService } from '../interfaces/opra-service.interface';

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
