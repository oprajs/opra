import { DocumentNode, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';
import { PlatformAdapter } from './platform-adapter.js';

/**
 * @class ExecutionContext
 */
export class ExecutionContext extends AsyncEventEmitter {
  readonly __docNode: DocumentNode;
  readonly __adapter: PlatformAdapter;
  readonly transport: OpraSchema.Transport;
  readonly platform: string;
  errors: Error[] = [];

  constructor(init: ExecutionContext.Initiator) {
    super();
    this.__adapter = init.__adapter;
    this.__docNode = init.__docNode || init.__adapter.document.node;
    this.transport = init.transport || 'custom';
    this.platform = init.platform || '';
  }
}

/**
 * @namespace ExecutionContext
 */
export namespace ExecutionContext {
  export interface Initiator {
    __adapter: PlatformAdapter;
    __docNode?: DocumentNode;
    transport?: OpraSchema.Transport;
    platform?: string;
  }
}
