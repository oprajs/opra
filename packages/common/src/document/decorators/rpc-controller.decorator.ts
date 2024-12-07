import { merge } from '@jsopen/objects';
import type { Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { RPC_CONTROLLER_METADATA } from '../constants.js';
import type { RpcController } from '../rpc/rpc-controller';
import type { RpcHeader } from '../rpc/rpc-header';

const CLASS_NAME_PATTERN = /^(.*)(Controller)$/;

export interface RpcControllerDecorator<
  T extends RpcControllerDecorator<any> = RpcControllerDecorator<any>,
> extends ClassDecorator {
  Header(
    name: string | RegExp,
    optionsOrType?: RpcHeader.Options | string | TypeThunkAsync | false,
  ): T;

  UseType(...type: TypeThunkAsync[]): T;
}

export interface RpcControllerDecoratorFactory {
  <T extends RpcController.Options>(options?: T): RpcControllerDecorator;
}

/**
 * @namespace RpcControllerDecoratorFactory
 */
export namespace RpcControllerDecoratorFactory {
  export type AugmentationFunction = (
    decorator: RpcControllerDecorator,
    decoratorChain: Function[],
    options?: RpcController.Options,
  ) => void;
}

const augmentationRegistry: RpcControllerDecoratorFactory.AugmentationFunction[] =
  [];

export function RpcControllerDecoratorFactory<O extends RpcController.Options>(
  options?: O,
): RpcControllerDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name) name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as RpcController.Metadata;
    const baseMetadata = Reflect.getOwnMetadata(
      RPC_CONTROLLER_METADATA,
      Object.getPrototypeOf(target),
    );
    if (baseMetadata) merge(metadata, baseMetadata, { deep: true });
    const oldMetadata = Reflect.getOwnMetadata(RPC_CONTROLLER_METADATA, target);
    if (oldMetadata) merge(metadata, oldMetadata, { deep: true });
    merge(
      metadata,
      {
        ...options,
        kind: OpraSchema.RpcController.Kind,
        name,
        path: name,
      },
      { deep: true },
    );
    Reflect.defineMetadata(RPC_CONTROLLER_METADATA, metadata, target);
    for (const fn of decoratorChain) fn(metadata, target);
    Reflect.defineMetadata(RPC_CONTROLLER_METADATA, metadata, target);
  } as RpcControllerDecorator;

  /**
   *
   */
  decorator.Header = (
    name: string | RegExp,
    arg1?: RpcHeader.Options | string | Type | false,
  ) => {
    decoratorChain.push((meta: RpcController.Metadata): void => {
      const paramMeta: RpcHeader.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              type: arg1,
            }
          : { ...arg1, name };
      meta.headers = meta.headers || [];
      meta.headers.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: RpcController.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn => fn(decorator, decoratorChain, options));

  return decorator;
}

RpcControllerDecoratorFactory.augment = function (
  fn: RpcControllerDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
