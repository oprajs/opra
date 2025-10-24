import { merge } from '@jsopen/objects';
import type { Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MQ_CONTROLLER_METADATA } from '../constants.js';
import type { MQHeader } from '../mq/mq-header';
import type { WSController } from '../ws/ws-controller.js';

const CLASS_NAME_PATTERN = /^(.*)(Controller)$/;

export interface WSControllerDecorator<
  T extends WSControllerDecorator<any> = WSControllerDecorator<any>,
> extends ClassDecorator {
  Header(
    name: string | RegExp,
    optionsOrType?: MQHeader.Options | string | TypeThunkAsync | false,
  ): T;

  UseType(...type: TypeThunkAsync[]): T;
}

export interface WSControllerDecoratorFactory {
  <T extends WSController.Options>(options?: T): WSControllerDecorator;
}

/**
 * @namespace WSControllerDecoratorFactory
 */
export namespace WSControllerDecoratorFactory {
  export type AugmentationFunction = (
    decorator: WSControllerDecorator,
    decoratorChain: Function[],
    options?: WSController.Options,
  ) => void;
}

const augmentationRegistry: WSControllerDecoratorFactory.AugmentationFunction[] =
  [];

export function WSControllerDecoratorFactory<O extends WSController.Options>(
  options?: O,
): WSControllerDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name) name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as WSController.Metadata;
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
        kind: OpraSchema.WSController.Kind,
        name,
        path: name,
      },
      { deep: true },
    );
    Reflect.defineMetadata(MQ_CONTROLLER_METADATA, metadata, target);
    for (const fn of decoratorChain) fn(metadata, target);
    Reflect.defineMetadata(MQ_CONTROLLER_METADATA, metadata, target);
  } as WSControllerDecorator;

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: WSController.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  augmentationRegistry.forEach(fn => fn(decorator, decoratorChain, options));

  return decorator;
}

WSControllerDecoratorFactory.augment = function (
  fn: WSControllerDecoratorFactory.AugmentationFunction,
) {
  augmentationRegistry.push(fn);
};
