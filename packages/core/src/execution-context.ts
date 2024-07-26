import { ApiDocument, OpraHttpError, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'strict-typed-events';

/**
 * @namespace ExecutionContext
 */
export namespace ExecutionContext {
  export interface Initiator {
    document: ApiDocument;
    protocol: OpraSchema.Protocol;
    platform: string;
  }

  export type OnFinishListener = (error: Error | undefined, context: ExecutionContext) => void | Promise<void>;
}

/**
 * @class ExecutionContext
 */
export abstract class ExecutionContext extends AsyncEventEmitter {
  readonly document: ApiDocument;
  readonly protocol: OpraSchema.Protocol;
  readonly platform: string;
  errors: OpraHttpError[] = [];

  protected constructor(init: ExecutionContext.Initiator) {
    super();
    this.document = init.document;
    this.protocol = init.protocol;
    this.platform = init.platform;
  }

  addListener(event: 'finish', listener: ExecutionContext.OnFinishListener): this {
    return super.addListener(event, listener);
  }

  removeListener(event: 'finish', listener: ExecutionContext.OnFinishListener): this {
    return super.removeListener(event, listener);
  }

  on(event: 'finish', listener: ExecutionContext.OnFinishListener): this {
    return super.on(event, listener);
  }

  off(event: 'finish', listener: ExecutionContext.OnFinishListener): this {
    return super.off(event, listener);
  }
}
