import { OpraSchema, RpcController, RpcOperation } from '@opra/common';
import { ExecutionContext } from '@opra/core';
import type { KafkaMessage } from 'kafkajs';
import type { AsyncEventEmitter } from 'node-events-async';
import type { KafkaAdapter } from './kafka-adapter.js';

export namespace KafkaContext {
  export interface Initiator extends Omit<ExecutionContext.Initiator, 'document' | 'protocol'> {
    adapter: KafkaAdapter;
    controller?: RpcController;
    controllerInstance?: any;
    operation?: RpcOperation;
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
  readonly controller?: RpcController;
  readonly controllerInstance?: any;
  readonly operation?: RpcOperation;
  readonly operationHandler?: Function;
  readonly key: any;
  readonly payload: any;
  readonly partition: number;
  readonly headers: Record<string, any>;
  readonly rawMessage: KafkaMessage;
  readonly heartbeat: () => Promise<void>;
  readonly pause: () => void;

  constructor(init: KafkaContext.Initiator) {
    super({ ...init, document: init.adapter.document, protocol: 'rpc' });
    this.adapter = init.adapter;
    this.platform = init.adapter.platform;
    this.protocol = 'rpc';
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
