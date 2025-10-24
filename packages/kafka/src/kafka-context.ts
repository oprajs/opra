import { MQController, MQOperation, OpraSchema } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import type { KafkaMessage } from 'kafkajs';
import type { AsyncEventEmitter } from 'node-events-async';
import type { KafkaAdapter } from './kafka-adapter.js';

/**
 * KafkaContext class provides the context for handling Kafka messages.
 * It extends the ExecutionContext and implements the AsyncEventEmitter.
 */
export class KafkaContext
  extends ExecutionContext
  implements AsyncEventEmitter
{
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  readonly adapter: KafkaAdapter;
  readonly controller?: MQController;
  readonly controllerInstance?: any;
  readonly operation?: MQOperation;
  readonly operationHandler?: Function;
  readonly topic: string;
  readonly key: any;
  readonly payload: any;
  readonly partition: number;
  readonly headers: Record<string, any>;
  readonly rawMessage: KafkaMessage;
  readonly heartbeat: () => Promise<void>;
  readonly pause: () => void;

  /**
   * Constructor
   * @param init the context options
   */
  constructor(init: KafkaContext.Initiator) {
    super({
      ...init,
      document: init.adapter.document,
      documentNode: init.controller?.node,
      protocol: 'mq',
    });
    this.adapter = init.adapter;
    this.platform = init.adapter.platform;
    this.protocol = 'mq';
    if (init.controller) this.controller = init.controller;
    if (init.controllerInstance)
      this.controllerInstance = init.controllerInstance;
    if (init.operation) this.operation = init.operation;
    if (init.operationHandler) this.operationHandler = init.operationHandler;
    this.partition = init.partition;
    this.headers = init.headers || {};
    this.topic = init.topic;
    this.key = init.key;
    this.payload = init.payload;
    this.heartbeat = init.heartbeat;
    this.pause = init.pause;
    this.rawMessage = init.rawMessage;
  }
}

export namespace KafkaContext {
  export interface Initiator
    extends Omit<
      ExecutionContext.Initiator,
      'document' | 'protocol' | 'documentNode'
    > {
    adapter: KafkaAdapter;
    controller?: MQController;
    controllerInstance?: any;
    operation?: MQOperation;
    operationHandler?: Function;
    topic: string;
    partition: number;
    key: any;
    payload: any;
    headers: Record<string, any>;
    rawMessage: KafkaMessage;

    heartbeat(): Promise<void>;

    pause(): void;
  }
}
