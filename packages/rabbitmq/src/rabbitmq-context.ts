import { MQController, MQOperation } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import type { AsyncEventEmitter } from 'node-events-async';
import * as rabbit from 'rabbitmq-client';
import type { RabbitmqAdapter } from './rabbitmq-adapter';

/**
 * RabbitmqContext class provides the context for handling RabbitMQ messages.
 * It extends the ExecutionContext and implements the AsyncEventEmitter.
 */
export class RabbitmqContext
  extends ExecutionContext
  implements AsyncEventEmitter
{
  declare readonly __contDef: MQController;
  declare readonly __oprDef: MQOperation;
  declare readonly __controller: any;
  declare readonly __handler?: Function;
  declare readonly __adapter: RabbitmqAdapter;
  readonly queue: string;
  readonly consumer: rabbit.Consumer;
  readonly message: rabbit.AsyncMessage;
  readonly content: any;
  readonly headers: Record<string, any>;
  readonly reply: RabbitmqAdapter.ReplyFunction;

  /**
   * Constructor
   * @param init the context options
   */
  constructor(init: RabbitmqContext.Initiator) {
    super({
      ...init,
      __docNode:
        init.__oprDef?.node ||
        init.__contDef?.node ||
        init.__adapter.document.node,
      transport: 'mq',
      platform: 'rabbitmq',
    });
    if (init.__contDef) this.__contDef = init.__contDef;
    if (init.__oprDef) this.__oprDef = init.__oprDef;
    if (init.__controller) this.__controller = init.__controller;
    if (init.__handler) this.__handler = init.__handler;
    this.consumer = init.consumer;
    this.queue = init.queue;
    this.message = init.message;
    this.headers = init.headers || {};
    this.content = init.content;
    this.reply = init.reply;
  }
}

export namespace RabbitmqContext {
  export interface Initiator extends Omit<
    ExecutionContext.Initiator,
    '__adapter' | 'transport' | 'platform' | '__docNode'
  > {
    __adapter: RabbitmqAdapter;
    __contDef?: MQController;
    __controller?: any;
    __oprDef?: MQOperation;
    __handler?: Function;
    consumer: rabbit.Consumer;
    content: any;
    headers: Record<string, any>;
    queue: string;
    message: rabbit.AsyncMessage;
    reply: RabbitmqAdapter.ReplyFunction;
  }
}
