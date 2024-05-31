import { AsyncEventEmitter } from 'strict-typed-events';
import { ApiDocument, OpraSchema } from '@opra/common';
import type { ExecutionContext } from './interfaces/execution-context.interface';

export namespace ExecutionContextHost {
  export interface Initiator {
    document: ApiDocument;
    platform: ExecutionContext.PlatformInfo;
  }
}

export abstract class ExecutionContextHost implements ExecutionContext {
  _eventEmitter = new AsyncEventEmitter();
  document: ApiDocument;
  platform: ExecutionContext.PlatformInfo;
  protocol: OpraSchema.Protocol;

  protected constructor(init: ExecutionContextHost.Initiator) {
    this.document = init.document;
    this.platform = init.platform;
  }

  onFinish(fn: (error: Error | undefined, context: ExecutionContext) => void | Promise<void>) {
    this._eventEmitter.on('finish', fn);
  }
}
