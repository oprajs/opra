import { StrictOmit, Writable } from 'ts-gems';
import { ExecutionContext } from '../../interfaces/execution-context.interface';
import { HttpContext } from '../../interfaces/http-context.interface';
import { ExecutionQuery } from '../execution-query';
import { OpraService } from '../opra-service';

export type ExecutionContextArgs = StrictOmit<Writable<ExecutionContext>, 'switchToHttp'>;

export abstract class ExecutionContextHost implements ExecutionContext {
  response: any;
  userContext?: any;
  errors?: any[];

  protected constructor(protected _args: ExecutionContextArgs) {
  }

  get service(): OpraService {
    return this._args.service;
  }

  get query(): ExecutionQuery {
    return this._args.query;
  }

  get returnPath(): string | undefined {
    return this._args.returnPath;
  }

  switchToHttp(): HttpContext {
    throw new Error(`Not an Http Execution Context`);
  }

}

export class HttpExecutionContextHost extends ExecutionContextHost {

  constructor(private _httpContext: HttpContext, args: ExecutionContextArgs) {
    super(args);
  }

  switchToHttp(): HttpContext {
    return this._httpContext;
  }

}
