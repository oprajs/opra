import { MsgController, MsgOperation, OpraSchema } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import { KafkaMessage } from 'kafkajs';
import { AsyncEventEmitter } from 'node-events-async';
import { KafkaAdapter } from './kafka-adapter.js';

export namespace KafkaContext {
  export interface Initiator extends Omit<ExecutionContext.Initiator, 'document' | 'protocol'> {
    adapter: KafkaAdapter;
    controller?: MsgController;
    controllerInstance?: any;
    operation?: MsgOperation;
    operationHandler?: Function;
    topic: string;
    partition: number;
    key: any;
    payload: any;
    headers: Record<string, any>;
    rawMessage: KafkaMessage;

    heartbeat(): Promise<void>;

    pause(): () => void;
  }
}

export class KafkaContext extends ExecutionContext implements AsyncEventEmitter {
  readonly protocol: OpraSchema.Transport;
  readonly platform: string;
  readonly adapter: KafkaAdapter;
  readonly controller?: MsgController;
  readonly controllerInstance?: any;
  readonly operation?: MsgOperation;
  readonly operationHandler?: Function;
  readonly key: any;
  readonly payload: any;
  readonly partition: number;
  readonly headers: Record<string, any>;
  readonly rawMessage: KafkaMessage;
  readonly heartbeat: () => Promise<void>;
  readonly pause: () => void;

  constructor(init: KafkaContext.Initiator) {
    super({ ...init, document: init.adapter.document, protocol: 'msg' });
    this.adapter = init.adapter;
    this.platform = init.adapter.platform;
    this.protocol = 'msg';
    if (init.controller) this.controller = init.controller;
    if (init.controllerInstance) this.controllerInstance = init.controllerInstance;
    if (init.operation) this.operation = init.operation;
    if (init.operationHandler) this.operationHandler = init.operationHandler;
    this.partition = init.partition;
    this.headers = init.headers || {};
    this.key = init.key;
    this.payload = init.payload;
    this.heartbeat = init.heartbeat;
    this.pause = init.pause;
    this.rawMessage = init.rawMessage;
  }
}
