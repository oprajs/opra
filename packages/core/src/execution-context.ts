import {
  ApiDocument,
  DocumentNode,
  OpraException,
  OpraSchema,
} from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';

/**
 * @namespace ExecutionContext
 */
export namespace ExecutionContext {
  export interface Initiator {
    document: ApiDocument;
    documentNode?: DocumentNode;
    protocol?: OpraSchema.Transport;
    platform?: string;
  }
}

/**
 * @class ExecutionContext
 */
export class ExecutionContext extends AsyncEventEmitter {
  readonly document: ApiDocument;
  documentNode: DocumentNode;
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  errors: OpraException[] = [];

  constructor(init: ExecutionContext.Initiator) {
    super();
    this.document = init.document;
    this.documentNode = init.documentNode || init.document.node;
    this.protocol = init.protocol || 'custom';
    this.platform = init.platform || '';
  }
}
