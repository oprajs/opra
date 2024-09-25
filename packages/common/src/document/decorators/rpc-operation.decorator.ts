import omit from 'lodash.omit';
import type { ThunkAsync, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { RPC_CONTROLLER_METADATA } from '../constants.js';
import type { RpcController } from '../rpc/rpc-controller';
import type { RpcHeader } from '../rpc/rpc-header';
import type { RpcOperation } from '../rpc/rpc-operation';
import type { RpcOperationResponse } from '../rpc/rpc-operation-response';

export interface RpcOperationDecorator {
  (target: Object, propertyKey: string): void;

  Header(name: string | RegExp, optionsOrType?: RpcHeader.Options | string | TypeThunkAsync): this;

  Response(payloadType: TypeThunkAsync | string, options?: RpcOperationResponse.Options): RpcOperationResponseDecorator;

  UseType(...type: Type[]): this;
}

export interface RpcOperationResponseDecorator {
  (target: Object, propertyKey: string): void;

  Header(name: string | RegExp, optionsOrType?: RpcHeader.Options | string | TypeThunkAsync): this;
}

/**
 * @namespace RpcOperationDecoratorFactory
 */
export interface RpcOperationDecoratorFactory {
  /**
   * Property decorator
   * @param decoratorChain
   * @param payloadType
   * @param options
   */ <T extends RpcOperation.Options>(
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): RpcOperationDecorator;
}

export namespace RpcOperationDecoratorFactory {
  export type AugmentationFunction = (
    decorator: RpcOperationDecorator,
    decoratorChain: Function[],
    payloadType: ThunkAsync<Type> | string,
    options?: RpcOperation.Options,
  ) => void;
}

const augmentationRegistry: RpcOperationDecoratorFactory.AugmentationFunction[] = [];

export function RpcOperationDecoratorFactory(
  decoratorChain: Function[],
  payloadType: ThunkAsync<Type> | string | TypeThunkAsync,
  options?: RpcOperation.Options,
): RpcOperationDecorator {
  let inResponse = false;
  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string') throw new TypeError(`Symbol properties can not be decorated`);

    const operationMetadata = {
      kind: OpraSchema.RpcOperation.Kind,
      channel: propertyKey,
      ...omit(options, ['kind']),
      payloadType,
    } as RpcOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(RPC_CONTROLLER_METADATA, target.constructor) ||
      {}) as RpcController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata, target, propertyKey);
    Reflect.defineMetadata(RPC_CONTROLLER_METADATA, controllerMetadata, target.constructor);
  }) as RpcOperationDecorator;

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: RpcOperation.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Header = (name: string | RegExp, arg1?: RpcHeader.Options | string | Type) => {
    decoratorChain.push((meta: RpcOperation.Metadata): void => {
      const headerMetadata: RpcHeader.Metadata =
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
  decorator.Response = (_payloadType: TypeThunkAsync | string, _options?: RpcOperationResponse.Options) => {
    decoratorChain.push((meta: RpcOperation.Metadata): void => {
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

RpcOperationDecoratorFactory.augment = function (fn: RpcOperationDecoratorFactory.AugmentationFunction) {
  augmentationRegistry.push(fn);
};
