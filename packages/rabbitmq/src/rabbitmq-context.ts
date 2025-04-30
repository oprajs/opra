import { OpraSchema, RpcController, RpcOperation } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { ConsumeMessage } from 'amqplib/properties';
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
  private _ackSent = false;
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  readonly adapter: RabbitmqAdapter;
  readonly controller?: RpcController;
  readonly controllerInstance?: any;
  readonly operation?: RpcOperation;
  readonly operationHandler?: Function;
  readonly queue: string;
  readonly channel: ChannelWrapper;
  readonly message: ConsumeMessage;
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
    this.channel = init.channel;
    this.queue = init.queue;
    this.message = init.message;
    this.headers = init.headers || {};
    this.content = init.content;
  }

  get properties() {
    return this.message.properties;
  }

  get fields() {
    return this.message.fields;
  }

  ack() {
    if (this._ackSent) return;
    this._ackSent = true;
    this.channel.ack(this.message);
  }

  nack() {
    if (this._ackSent) return;
    this._ackSent = true;
    this.channel.nack(this.message);
  }
}

export namespace RabbitmqContext {
  export interface Initiator
    extends Omit<
      ExecutionContext.Initiator,
      'document' | 'protocol' | 'documentNode'
    > {
    adapter: RabbitmqAdapter;
    channel: ChannelWrapper;
    controller?: RpcController;
    controllerInstance?: any;
    operation?: RpcOperation;
    operationHandler?: Function;
    content: any;
    headers: Record<string, any>;
    queue: string;
    message: ConsumeMessage;
  }
}
