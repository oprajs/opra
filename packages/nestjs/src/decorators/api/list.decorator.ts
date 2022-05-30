import {ENTITY_METHOD_METADATA} from '../../constants';

export function List(options?): MethodDecorator {

  const ListDecorator = function (target: Object,
                                  propertyKey: string | symbol,
                                  descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    const metaData = {
      ...options,
      method: 'list'
    };
    Reflect.defineMetadata(ENTITY_METHOD_METADATA, metaData, target, propertyKey);
  }
  return ListDecorator;
}
