import '@opra/core';
import { classes, MsgOperation } from '@opra/common';
import { KAFKA_OPERATION_METADATA, KAFKA_OPERATION_METADATA_RESOLVER } from '../constants.js';
import { KafkaOperationOptions } from '../types.js';

declare module '@opra/common' {
  interface MsgOperationDecorator {
    Kafka(config: KafkaOperationOptions | (() => KafkaOperationOptions | Promise<KafkaOperationOptions>)): this;
  }
}

/** Implementation **/

classes.MsgOperationDecoratorFactory.augment((decorator: any, decoratorChain) => {
  decorator.Kafka = (
    config: KafkaOperationOptions | (() => KafkaOperationOptions | Promise<KafkaOperationOptions>),
  ): any => {
    decoratorChain.push((_: MsgOperation.Metadata, target: Object, propertyKey: string | symbol): void => {
      if (typeof config === 'function') {
        Reflect.defineMetadata(KAFKA_OPERATION_METADATA_RESOLVER, config, target, propertyKey);
      } else {
        Reflect.defineMetadata(KAFKA_OPERATION_METADATA, { ...config }, target, propertyKey);
      }
    });
    return decorator;
  };
});
