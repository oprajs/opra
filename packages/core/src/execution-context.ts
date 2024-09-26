import { ApiDocument, OpraHttpError, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';

/**
 * @namespace ExecutionContext
 */
export namespace ExecutionContext {
  export interface Initiator {
    document: ApiDocument;
    protocol: OpraSchema.Transport;
    platform: string;
  }
}

/**
 * @class ExecutionContext
 */
export abstract class ExecutionContext extends AsyncEventEmitter {
  readonly shared = new Map();
  readonly document: ApiDocument;
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  errors: OpraHttpError[] = [];

  protected constructor(init: ExecutionContext.Initiator) {
    super();
    this.document = init.document;
    this.protocol = init.protocol;
    this.platform = init.platform;
  }
}
