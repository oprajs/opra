import omit from 'lodash.omit';
import { Type } from 'ts-gems';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA, EXTRACT_TYPENAME_PATTERN, TYPENAME_PATTERN } from '../../constants.js';
import type { SimpleType } from '../simple-type.js';

export interface SimpleTypeDecorator extends ClassDecorator {
}

export interface createSimpleTypeDecorator {
  (options?: SimpleType.DecoratorOptions): SimpleTypeDecorator;
}

export function createSimpleTypeDecorator(options?: SimpleType.DecoratorOptions): SimpleTypeDecorator {
  return function (target: Function) {
    let name: string;
    if (options?.name) {
      if (!TYPENAME_PATTERN.test(options.name))
        throw new TypeError(`"${options.name}" is not a valid type name`);
      name = options.name;
    } else {
      name = target.name.match(EXTRACT_TYPENAME_PATTERN)?.[1] || target.name;
    }
    name = name.charAt(0).toLowerCase() + name.substring(1);
    const metadata: SimpleType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target) || ({} as any);
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.name = name;
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name']));
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
  }
}

export function createAttributeDecorator(options?: Partial<OpraSchema.Attribute>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be decorated with Attribute`);
    const metadata: SimpleType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) || ({} as any);
    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    let format = 'string' as any;
    if (designType === Boolean)
      format = 'boolean';
    if (designType === Number)
      format = 'number';
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.attributes = metadata.attributes || {};
    metadata.attributes[propertyKey] = {
      format,
      description: options?.description,
      deprecated: options?.deprecated
    }
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target.constructor);
  }
}
