import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ContextType,
  IExecutionContext,
  IHttpExecutionContext
} from '../../interfaces/execution-context.interface.js';

export abstract class ExecutionContextHost extends AsyncEventEmitter implements IExecutionContext {

  userContext: any;

  protected constructor() {
    super();
  }

  abstract getType(): ContextType;

  abstract getPlatform(): string;

  switchToHttp(): IHttpExecutionContext {
    throw new Error(`This is not an http context`);
  }

  onFinish(fn: (...args: any[]) => (void | Promise<void>)) {
    this.on('finish', fn);
  }

}
