import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ContextType,
  ExecutionContext,
  HttpExecutionContext
} from '../interfaces/execution-context.interface.js';

export abstract class ExecutionContextHost extends AsyncEventEmitter implements ExecutionContext {

  userContext: any;

  protected constructor() {
    super();
  }

  abstract getType(): ContextType;

  abstract getPlatform(): string;

  switchToHttp(): HttpExecutionContext {
    throw new Error(`This is not an http context`);
  }

}
