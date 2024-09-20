import omit from 'lodash.omit';
import merge from 'putil-merge';
import type { Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { MSG_CONTROLLER_METADATA } from '../constants.js';
import type { MsgController } from '../msg/msg-controller.js';
import type { MsgHeader } from '../msg/msg-header.js';

const CLASS_NAME_PATTERN = /^(.*)(Controller)$/;

export interface MsgControllerDecorator<T extends MsgControllerDecorator<any> = MsgControllerDecorator<any>>
  extends ClassDecorator {
  Header(name: string | RegExp, optionsOrType?: MsgHeader.Options | string | TypeThunkAsync | false): T;

  UseType(...type: TypeThunkAsync[]): T;
}

export interface MsgControllerDecoratorFactory {
  <T extends MsgController.Options>(options?: T): MsgControllerDecorator;
}

export function MsgControllerDecoratorFactory<O extends MsgController.Options>(options?: O): MsgControllerDecorator {
  const decoratorChain: Function[] = [];
  /**
   *
   */
  const decorator = function (target: Function) {
    let name = options?.name;
    if (!name) name = CLASS_NAME_PATTERN.exec(target.name)?.[1] || target.name;

    const metadata = {} as MsgController.Metadata;
    const baseMetadata = Reflect.getOwnMetadata(MSG_CONTROLLER_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata) merge(metadata, baseMetadata, { deep: true });
    const oldMetadata = Reflect.getOwnMetadata(MSG_CONTROLLER_METADATA, target);
    if (oldMetadata) merge(metadata, oldMetadata, { deep: true });
    merge(
      metadata,
      {
        kind: OpraSchema.MsgController.Kind,
        name,
        path: name,
        ...omit(options, ['kind', 'name', 'instance', 'endpoints', 'key']),
      },
      { deep: true },
    );
    Reflect.defineMetadata(MSG_CONTROLLER_METADATA, metadata, target);
    for (const fn of decoratorChain) fn(metadata);
    Reflect.defineMetadata(MSG_CONTROLLER_METADATA, metadata, target);
  } as MsgControllerDecorator;

  /**
   *
   */
  decorator.Header = (name: string | RegExp, arg1?: MsgHeader.Options | string | Type | false) => {
    decoratorChain.push((meta: MsgController.Metadata): void => {
      const paramMeta: MsgHeader.Metadata =
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
    decoratorChain.push((meta: MsgController.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  return decorator;
}
