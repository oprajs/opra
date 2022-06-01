import {ENTITY_METHOD_METADATA} from '../../constants.js';
import {ControllerMethodMetadata} from '../types.js';

export function List(): MethodDecorator {

  const ListDecorator = function (target: Object,
                                  propertyKey: string | symbol,
                                  descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    /* istanbul ignore next */
    if (typeof propertyKey !== 'string')
      throw new TypeError('Symbol properties can not be used as api method');
    const metaData: ControllerMethodMetadata = {
      method: 'list',
      name: propertyKey
    };
    Reflect.defineMetadata(ENTITY_METHOD_METADATA, metaData, target, propertyKey);
  }
  return ListDecorator;
}
