import {ENTITY_METHOD_METADATA} from '../../constants.js';
import {ControllerMethodMetadata} from '../types.js';

export function Get(): MethodDecorator {

  const GetDecorator = function (target: Object,
                                 propertyKey: string | symbol,
                                 descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    /* istanbul ignore next */
    if (typeof propertyKey !== 'string')
      throw new TypeError('Symbol properties can not be used as api method');
    const metaData: ControllerMethodMetadata = {
      method: 'get',
      name: propertyKey
    };
    Reflect.defineMetadata(ENTITY_METHOD_METADATA, metaData, target, propertyKey);
  }
  return GetDecorator;
}
