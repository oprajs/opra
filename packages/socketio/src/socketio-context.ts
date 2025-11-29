import { WSController, WSOperation } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import type { AsyncEventEmitter } from 'node-events-async';
import type { SocketioAdapter } from './socketio-adapter.js';

/**
 * Provides the context for handling messages.
 * It extends the ExecutionContext and implements the AsyncEventEmitter.
 */
export class SocketioContext
  extends ExecutionContext
  implements AsyncEventEmitter
{
  declare readonly __contDef: WSController;
  declare readonly __oprDef: WSOperation;
  declare readonly __controller: any;
  declare readonly __handler?: Function;
  declare readonly __adapter: SocketioAdapter;
  readonly event: string;
  readonly parameters: any[] = [];

  /**
   * Constructor
   * @param init the context options
   */
  constructor(init: SocketioContext.Initiator) {
    super({
      ...init,
      __docNode:
        init.__oprDef?.node ||
        init.__contDef?.node ||
        init.__adapter.document.node,
      transport: 'ws',
      platform: 'socketio',
    });
    if (init.__contDef) this.__contDef = init.__contDef;
    if (init.__controller) this.__controller = init.__controller;
    if (init.__oprDef) this.__oprDef = init.__oprDef;
    if (init.__handler) this.__handler = init.__handler;
    this.event = init.event;
    this.parameters = init.parameters || [];
  }
}

export namespace SocketioContext {
  export interface Initiator extends Omit<
    ExecutionContext.Initiator,
    'document' | 'transport' | 'platform' | '__docNode'
  > {
    __adapter: SocketioAdapter;
    __contDef?: WSController;
    __oprDef?: WSOperation;
    __controller?: any;
    __handler?: Function;
    event: string;
    parameters?: any[];
  }
}
