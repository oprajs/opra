import { OpraSchema, RpcController, RpcOperation } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import amqplib from 'amqplib';
import type { AsyncEventEmitter } from 'node-events-async';
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
  readonly fields: amqplib.MessageFields;
  readonly properties: amqplib.MessageProperties;
  readonly content: any;
  readonly headers: Record<string, any>;

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
    this.queue = init.queue;
    this.fields = init.fields;
    this.properties = init.properties;
    this.headers = init.headers || {};
    this.content = init.content;
  }
}

export namespace RabbitmqContext {
  export interface Initiator
    extends Omit<
      ExecutionContext.Initiator,
      'document' | 'protocol' | 'documentNode'
    > {
    adapter: RabbitmqAdapter;
    controller?: RpcController;
    controllerInstance?: any;
    operation?: RpcOperation;
    operationHandler?: Function;
    content: any;
    headers: Record<string, any>;
    queue: string;
    fields: amqplib.MessageFields;
    properties: amqplib.MessageProperties;
  }
}
