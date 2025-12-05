import { omit } from '@jsopen/objects';
import type { ThunkAsync, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { WS_CONTROLLER_METADATA } from '../constants.js';
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
   * @param type
   * @param options
   */ <T extends WSOperation.Options>(
    decoratorChain: Function[],
    type: ThunkAsync<Type> | string,
    options?: T,
  ): WSOperationDecorator;
}

export namespace WSOperationDecoratorFactory {
  export type AugmentationFunction = (
    decorator: WSOperationDecorator,
    decoratorChain: Function[],
    options?: WSOperation.Options,
  ) => void;
}

const augmentationRegistry: WSOperationDecoratorFactory.AugmentationFunction[] =
  [];

export function WSOperationDecoratorFactory(
  decoratorChain: Function[],
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
      event: propertyKey,
      ...omit(options as any, ['kind']),
    } as WSOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(
      WS_CONTROLLER_METADATA,
      target.constructor,
    ) || {}) as WSController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata, target, propertyKey);
    Reflect.defineMetadata(
      WS_CONTROLLER_METADATA,
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

  augmentationRegistry.forEach(fn => fn(decorator, decoratorChain, options));

  return decorator;
}

WSOperationDecoratorFactory.augment = function (
  fn: WSOperationDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
