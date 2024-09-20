import omit from 'lodash.omit';
import type { ThunkAsync, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MSG_CONTROLLER_METADATA } from '../constants.js';
import type { MsgController } from '../msg/msg-controller.js';
import type { MsgHeader } from '../msg/msg-header.js';
import type { MsgOperation } from '../msg/msg-operation.js';
import type { MsgOperationResponse } from '../msg/msg-operation-response.js';

export interface MsgOperationDecorator {
  (target: Object, propertyKey: string): void;

  Header(name: string | RegExp, optionsOrType?: MsgHeader.Options | string | TypeThunkAsync): this;

  Response(payloadType: TypeThunkAsync | string, options?: MsgOperationResponse.Options): MsgOperationResponseDecorator;

  UseType(...type: Type[]): this;
}

export interface MsgOperationResponseDecorator {
  (target: Object, propertyKey: string): void;

  Header(name: string | RegExp, optionsOrType?: MsgHeader.Options | string | TypeThunkAsync): this;
}

export interface MsgOperationDecoratorFactory {
  /**
   * Property decorator
   * @param decoratorChain
   * @param payloadType
   * @param options
   */ <T extends MsgOperation.Options>(
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): MsgOperationDecorator;
}

export namespace MsgOperationDecoratorFactory {
  export type AugmentationFunction = (
    decorator: MsgOperationDecorator,
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: MsgOperation.Options,
  ) => void;
}

const augmentationRegistry: MsgOperationDecoratorFactory.AugmentationFunction[] = [];

export function MsgOperationDecoratorFactory(
  decoratorChain: Function[],
  payloadType: ThunkAsync<Type> | string | TypeThunkAsync,
  options?: MsgOperation.Options,
): MsgOperationDecorator {
  let inResponse = false;
  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string') throw new TypeError(`Symbol properties can not be decorated`);

    const operationMetadata = {
      kind: OpraSchema.MsgOperation.Kind,
      channel: propertyKey,
      ...omit(options, ['kind']),
      payloadType,
    } as MsgOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(MSG_CONTROLLER_METADATA, target.constructor) ||
      {}) as MsgController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata, target, propertyKey);
    Reflect.defineMetadata(MSG_CONTROLLER_METADATA, controllerMetadata, target.constructor);
  }) as MsgOperationDecorator;

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: MsgOperation.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Header = (name: string | RegExp, arg1?: MsgHeader.Options | string | Type) => {
    decoratorChain.push((meta: MsgOperation.Metadata): void => {
      const headerMetadata: MsgHeader.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              type: arg1,
            }
          : { ...arg1, name };
      const subMeta = inResponse ? meta.response! : meta;
      if (subMeta.headers) {
        subMeta.headers = subMeta.headers.filter(p => String(p.name) !== String(name));
      } else subMeta.headers = [];
      subMeta.headers.push(headerMetadata);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Response = (_payloadType: TypeThunkAsync | string, _options?: MsgOperationResponse.Options) => {
    decoratorChain.push((meta: MsgOperation.Metadata): void => {
      inResponse = true;
      meta.response = {
        ..._options,
        payloadType: _payloadType,
      };
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn => fn(decorator, decoratorChain, payloadType, options));

  return decorator;
}

MsgOperationDecoratorFactory.augment = function (fn: MsgOperationDecoratorFactory.AugmentationFunction) {
  augmentationRegistry.push(fn);
};
