import { OpraException, OpraSchema } from '@opra/common';
import { AsyncEventEmitter } from 'node-events-async';
import type { ExecutionContext } from './execution-context.js';
import type { PlatformAdapter } from './platform-adapter.js';

/**
 * ExecutionBundle provides a context for executing multiple operations.
 */
export class ExecutionBundle extends AsyncEventEmitter {
  /** The platform adapter that created this context */
  readonly __adapter: PlatformAdapter;
  /** The transport protocol being used (e.g., 'http', 'socketio') */
  readonly transport?: OpraSchema.Transport;
  /** The platform name (e.g., 'express', 'koa') */
  readonly platform: string = '';
  /** A collection of ExecutionContext created during execution */
  contexts: ExecutionContext[] = [];
  /** Whether a transaction will be used in this bundle context */
  readonly transaction?: boolean;
  success?: boolean;
  finished?: boolean;
  error?: OpraException;

  /**
   * Creates a new ExecutionContext instance.
   *
   * @param init - The initialization parameters for the context.
   */
  constructor(init: ExecutionBundle.Initiator) {
    super();
    this.__adapter = init.__adapter;
    this.transport = init.transport;
    this.platform = init.platform || '';
  }
}

/**
 * Namespace for {@link ExecutionBundle} related types and interfaces.
 */
export namespace ExecutionBundle {
  /**
   * Initialization parameters for creating an {@link ExecutionBundle}.
   */
  export interface Initiator {
    /** The platform adapter */
    __adapter: PlatformAdapter;
    /** The transport protocol */
    transport?: OpraSchema.Transport;
    /** The platform name */
    platform?: string;
  }
}
