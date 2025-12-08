import { TypeThunkAsync } from 'ts-gems';
import { WS_PARAM_METADATA } from '../constants.js';

export function WsParam(type?: TypeThunkAsync | string): ParameterDecorator {
  return (
    target,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Un-named properties can not be decorated`);
    if (!type) {
      const designTypes = Reflect.getMetadata(
        'design:paramtypes',
        target,
        propertyKey,
      );
      type = designTypes[parameterIndex];
      if (!type) throw new TypeError(`Missing parameter type`);
    }
    let paramMetadata: any[] = Reflect.getOwnMetadata(
      WS_PARAM_METADATA,
      target,
      propertyKey,
    );
    if (!paramMetadata) {
      paramMetadata = [];
      Reflect.defineMetadata(
        WS_PARAM_METADATA,
        paramMetadata,
        target,
        propertyKey,
      );
    }
    paramMetadata.push({ type, parameterIndex });
  };
}
