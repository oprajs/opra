import { DocumentNode, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';
import type { ExecutionBundle } from './execution-bundle.js';
import type { PlatformAdapter } from './platform-adapter.js';

/**
 * ExecutionContext provides a context for executing operations within an adapter.
 * It carries information about the document node, adapter, transport, and platform.
 */
export class ExecutionContext extends AsyncEventEmitter {
  /** The platform adapter that created this context */
  readonly __adapter: PlatformAdapter;
  /** The document node associated with this context */
  readonly __docNode: DocumentNode;
  /** The execution bundle associated with this context */
  readonly bundle?: ExecutionBundle;
  /** The transport protocol being used (e.g., 'http', 'socketio') */
  readonly transport?: OpraSchema.Transport;
  /** The platform name (e.g., 'express', 'koa') */
  readonly platform: string = '';
  /** A collection of errors encountered during execution */
  errors: Error[] = [];

  /**
   * Creates a new ExecutionContext instance.
   *
   * @param init - The initialization parameters for the context.
   */
  constructor(init: ExecutionContext.Initiator) {
    super();
    this.__adapter = init.__adapter;
    this.__docNode = init.__docNode;
    this.bundle = init.bundle;
    this.transport = init.transport;
    this.platform = init.platform || '';
  }
}

/**
 * Namespace for {@link ExecutionContext} related types and interfaces.
 */
export namespace ExecutionContext {
  /**
   * Initialization parameters for creating an {@link ExecutionContext}.
   */
  export interface Initiator {
    /** The platform adapter */
    __adapter: PlatformAdapter;
    /** The document node */
    __docNode: DocumentNode;
    /** The execution bundle */
    bundle?: ExecutionBundle;
    /** The transport protocol */
    transport?: OpraSchema.Transport;
    /** The platform name */
    platform?: string;
  }
}
