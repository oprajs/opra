import { omit } from '@jsopen/objects';
import type { ThunkAsync, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MQ_CONTROLLER_METADATA } from '../constants.js';
import type { MQController } from '../mq/mq-controller.js';
import type { MQHeader } from '../mq/mq-header';
import type { MQOperation } from '../mq/mq-operation.js';
import type { MQOperationResponse } from '../mq/mq-operation-response.js';

export interface MQOperationDecorator {
  (target: Object, propertyKey: string): void;

  Header(
    name: string | RegExp,
    optionsOrType?: MQHeader.Options | string | TypeThunkAsync,
  ): this;

  Response(
    payloadType: TypeThunkAsync | string,
    options?: MQOperationResponse.Options,
  ): MQOperationResponseDecorator;

  UseType(...type: Type[]): this;
}

export interface MQOperationResponseDecorator {
  (target: Object, propertyKey: string): void;

  Header(
    name: string | RegExp,
    optionsOrType?: MQHeader.Options | string | TypeThunkAsync,
  ): this;
}

/**
 * @namespace MQOperationDecoratorFactory
 */
export interface MQOperationDecoratorFactory {
  /**
   * Property decorator
   * @param decoratorChain
   * @param payloadType
   * @param options
   */ <T extends MQOperation.Options>(
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): MQOperationDecorator;
}

export namespace MQOperationDecoratorFactory {
  export type AugmentationFunction = (
    decorator: MQOperationDecorator,
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: MQOperation.Options,
  ) => void;
}

const augmentationRegistry: MQOperationDecoratorFactory.AugmentationFunction[] =
  [];

export function MQOperationDecoratorFactory(
  decoratorChain: Function[],
  payloadType: ThunkAsync<Type> | string | TypeThunkAsync,
  options?: MQOperation.Options,
): MQOperationDecorator {
  let inResponse = false;
  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can not be decorated`);

    const operationMetadata = {
      kind: OpraSchema.MQOperation.Kind,
      channel: propertyKey,
      payloadType,
      ...omit(options as any, ['kind', 'payloadType']),
    } as MQOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(
      MQ_CONTROLLER_METADATA,
      target.constructor,
    ) || {}) as MQController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata, target, propertyKey);
    Reflect.defineMetadata(
      MQ_CONTROLLER_METADATA,
      controllerMetadata,
      target.constructor,
    );
  }) as MQOperationDecorator;

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: MQOperation.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Header = (
    name: string | RegExp,
    arg1?: MQHeader.Options | string | Type,
  ) => {
    decoratorChain.push((meta: MQOperation.Metadata): void => {
      const headerMetadata: MQHeader.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              type: arg1,
            }
          : { ...arg1, name };
      const subMeta = inResponse ? meta.response! : meta;
      if (subMeta.headers) {
        subMeta.headers = subMeta.headers.filter(
          p => String(p.name) !== String(name),
        );
      } else subMeta.headers = [];
      subMeta.headers.push(headerMetadata);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Response = (
    _payloadType: TypeThunkAsync | string,
    _options?: MQOperationResponse.Options,
  ) => {
    decoratorChain.push((meta: MQOperation.Metadata): void => {
      inResponse = true;
      meta.response = {
        ..._options,
        payloadType: _payloadType,
      };
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn =>
    fn(decorator, decoratorChain, payloadType, options),
  );

  return decorator;
}

MQOperationDecoratorFactory.augment = function (
  fn: MQOperationDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
