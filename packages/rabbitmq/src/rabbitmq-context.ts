import { OpraSchema, RpcController, RpcOperation } from '@opra/common';
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
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  readonly adapter: RabbitmqAdapter;
  readonly controller?: RpcController;
  readonly controllerInstance?: any;
  readonly operation?: RpcOperation;
  readonly operationHandler?: Function;
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
      document: init.adapter.document,
      documentNode: init.controller?.node,
      protocol: 'rpc',
    });
    this.adapter = init.adapter;
    this.platform = init.adapter.platform;
    this.protocol = 'rpc';
    if (init.controller) this.controller = init.controller;
    if (init.controllerInstance)
      this.controllerInstance = init.controllerInstance;
    if (init.operation) this.operation = init.operation;
    if (init.operationHandler) this.operationHandler = init.operationHandler;
    this.consumer = init.consumer;
    this.queue = init.queue;
    this.message = init.message;
    this.headers = init.headers || {};
    this.content = init.content;
    this.reply = init.reply;
  }
}

export namespace RabbitmqContext {
  export interface Initiator
    extends Omit<
      ExecutionContext.Initiator,
      'document' | 'protocol' | 'documentNode'
    > {
    adapter: RabbitmqAdapter;
    consumer: rabbit.Consumer;
    controller?: RpcController;
    controllerInstance?: any;
    operation?: RpcOperation;
    operationHandler?: Function;
    content: any;
    headers: Record<string, any>;
    queue: string;
    message: rabbit.AsyncMessage;
    reply: RabbitmqAdapter.ReplyFunction;
  }
}
