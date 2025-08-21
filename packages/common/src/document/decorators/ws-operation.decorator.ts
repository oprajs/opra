import { omit } from '@jsopen/objects';
import type { ThunkAsync, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MQ_CONTROLLER_METADATA } from '../constants.js';
import type { WSController } from '../ws/ws-controller.js';
import type { WSOperation } from '../ws/ws-operation.js';

export interface WSOperationDecorator {
  (target: Object, propertyKey: string): void;

  UseType(...type: Type[]): this;
}

/**
 * @namespace WSOperationDecoratorFactory
 */
export interface WSOperationDecoratorFactory {
  /**
   * Property decorator
   * @param decoratorChain
   * @param payloadType
   * @param options
   */ <T extends WSOperation.Options>(
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): WSOperationDecorator;
}

export namespace WSOperationDecoratorFactory {
  export type AugmentationFunction = (
    decorator: WSOperationDecorator,
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: WSOperation.Options,
  ) => void;
}

const augmentationRegistry: WSOperationDecoratorFactory.AugmentationFunction[] =
  [];

export function WSOperationDecoratorFactory(
  decoratorChain: Function[],
  payloadType: ThunkAsync<Type> | string | TypeThunkAsync,
  options?: WSOperation.Options,
): WSOperationDecorator {
  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can not be decorated`);

    const operationMetadata = {
      kind: OpraSchema.WSOperation.Kind,
      channel: propertyKey,
      payloadType,
      ...omit(options as any, ['kind', 'payloadType']),
    } as WSOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(
      MQ_CONTROLLER_METADATA,
      target.constructor,
    ) || {}) as WSController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata, target, propertyKey);
    Reflect.defineMetadata(
      MQ_CONTROLLER_METADATA,
      controllerMetadata,
      target.constructor,
    );
  }) as WSOperationDecorator;

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: WSOperation.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn =>
    fn(decorator, decoratorChain, payloadType, options),
  );

  return decorator;
}

WSOperationDecoratorFactory.augment = function (
  fn: WSOperationDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
