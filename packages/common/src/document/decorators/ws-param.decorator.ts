import { TypeThunkAsync } from 'ts-gems';
import { WS_CONTROLLER_METADATA } from '../constants.js';
import type { WSController } from '../ws/ws-controller.js';

export function WsParam(type?: TypeThunkAsync | string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const controllerMetadata: WSController.Metadata | undefined =
      Reflect.getOwnMetadata(WS_CONTROLLER_METADATA, target.constructor);
    if (!controllerMetadata)
      throw new TypeError('This class is not decorated with @WsController');
  };
}
