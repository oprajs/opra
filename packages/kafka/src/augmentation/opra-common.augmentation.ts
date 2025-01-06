import '@opra/core';
import { classes, RpcOperation } from '@opra/common';
import {
  KAFKA_OPERATION_METADATA,
  KAFKA_OPERATION_METADATA_RESOLVER,
} from '../constants.js';
import { KafkaAdapter } from '../kafka-adapter.js';

declare module '@opra/common' {
  interface RpcOperationDecorator {
    Kafka(
      config:
        | KafkaAdapter.OperationOptions
        | (() =>
            | KafkaAdapter.OperationOptions
            | Promise<KafkaAdapter.OperationOptions>),
    ): this;
  }
}

/** Implementation **/

classes.RpcOperationDecoratorFactory.augment(
  (decorator: any, decoratorChain) => {
    decorator.Kafka = (config: KafkaAdapter.OperationOptions): any => {
      decoratorChain.push(
        (
          _: RpcOperation.Metadata,
          target: Object,
          propertyKey: string | symbol,
        ): void => {
          if (typeof config === 'function') {
            Reflect.defineMetadata(
              KAFKA_OPERATION_METADATA_RESOLVER,
              config,
              target,
              propertyKey,
            );
          } else {
            Reflect.defineMetadata(
              KAFKA_OPERATION_METADATA,
              { ...config },
              target,
              propertyKey,
            );
          }
        },
      );
      return decorator;
    };
  },
);
