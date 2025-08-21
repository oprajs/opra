import { merge } from '@jsopen/objects';
import type { Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MQ_CONTROLLER_METADATA } from '../constants.js';
import type { MQController } from '../mq/mq-controller.js';
import type { MQHeader } from '../mq/mq-header';

const CLASS_NAME_PATTERN = /^(.*)(Controller)$/;

export interface MQControllerDecorator<
  T extends MQControllerDecorator<any> = MQControllerDecorator<any>,
> extends ClassDecorator {
  Header(
    name: string | RegExp,
    optionsOrType?: MQHeader.Options | string | TypeThunkAsync | false,
  ): T;

  UseType(...type: TypeThunkAsync[]): T;
}

export interface MQControllerDecoratorFactory {
  <T extends MQController.Options>(options?: T): MQControllerDecorator;
}

/**
 * @namespace MQControllerDecoratorFactory
 */
export namespace MQControllerDecoratorFactory {
  export type AugmentationFunction = (
    decorator: MQControllerDecorator,
    decoratorChain: Function[],
    options?: MQController.Options,
  ) => void;
}

const augmentationRegistry: MQControllerDecoratorFactory.AugmentationFunction[] =
  [];

export function MQControllerDecoratorFactory<O extends MQController.Options>(
  options?: O,
): MQControllerDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name) name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as MQController.Metadata;
    const baseMetadata = Reflect.getOwnMetadata(
      MQ_CONTROLLER_METADATA,
      Object.getPrototypeOf(target),
    );
    if (baseMetadata) merge(metadata, baseMetadata, { deep: true });
    const oldMetadata = Reflect.getOwnMetadata(MQ_CONTROLLER_METADATA, target);
    if (oldMetadata) merge(metadata, oldMetadata, { deep: true });
    merge(
      metadata,
      {
        ...options,
        kind: OpraSchema.MQController.Kind,
        name,
        path: name,
      },
      { deep: true },
    );
    Reflect.defineMetadata(MQ_CONTROLLER_METADATA, metadata, target);
    for (const fn of decoratorChain) fn(metadata, target);
    Reflect.defineMetadata(MQ_CONTROLLER_METADATA, metadata, target);
  } as MQControllerDecorator;

  /**
   *
   */
  decorator.Header = (
    name: string | RegExp,
    arg1?: MQHeader.Options | string | Type | false,
  ) => {
    decoratorChain.push((meta: MQController.Metadata): void => {
      const paramMeta: MQHeader.Metadata =
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
    decoratorChain.push((meta: MQController.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn => fn(decorator, decoratorChain, options));

  return decorator;
}

MQControllerDecoratorFactory.augment = function (
  fn: MQControllerDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
