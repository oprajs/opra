import '@opra/core';
import { classes, RpcOperation } from '@opra/common';
import {
  RMQ_OPERATION_METADATA,
  RMQ_OPERATION_METADATA_RESOLVER,
} from '../constants.js';
import { RabbitmqAdapter } from '../rabbitmq-adapter.js';

declare module '@opra/common' {
  interface RpcOperationDecorator {
    RabbitMQ(
      config:
        | RabbitmqAdapter.OperationOptions
        | (() =>
            | RabbitmqAdapter.OperationOptions
            | Promise<RabbitmqAdapter.OperationOptions>),
    ): this;
  }
}

/** Implementation **/

classes.RpcOperationDecoratorFactory.augment(
  (decorator: any, decoratorChain) => {
    decorator.RabbitMQ = (config: RabbitmqAdapter.OperationOptions): any => {
      decoratorChain.push(
        (
          _: RpcOperation.Metadata,
          target: Object,
          propertyKey: string | symbol,
        ): void => {
          if (typeof config === 'function') {
            Reflect.defineMetadata(
              RMQ_OPERATION_METADATA_RESOLVER,
              config,
              target,
              propertyKey,
            );
          } else {
            Reflect.defineMetadata(
              RMQ_OPERATION_METADATA,
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
