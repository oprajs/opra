import {ArgumentsHost, ContextType, ExecutionContext} from '@nestjs/common';
import {ExecutionContextHost} from '@nestjs/core/helpers/execution-context-host';

export type OpraContextType = 'opra' | ContextType;

export interface OpraArgumentsHost extends ArgumentsHost {

  getArgs<T = any>(): T;

  getContext<T = any>(): T;
}

export class OpraExecutionContext extends ExecutionContextHost implements OpraArgumentsHost {
  static create(context: ExecutionContext): OpraExecutionContext {
    const type = context.getType();
    const opraContext = new OpraExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler(),
    );
    opraContext.setType(type);
    return opraContext;
  }

  getType<TContextType extends string = OpraContextType>(): TContextType {
    return super.getType();
  }

  getContext<T = any>(): T {
    return this.getArgByIndex(0);
  }

  getArgs<T = any>(): T {
    return this.getArgByIndex(1);
  }

}
