import omit from 'lodash.omit';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA, EXTRACT_TYPENAME_PATTERN, TYPENAME_PATTERN } from '../../constants.js';
import type { ComplexType } from '../complex-type';

export function ComplexTypeDecorator(options?: ComplexType.DecoratorOptions) {
  return function (target: Function) {
    let name: string;
    if (options?.name) {
      if (!TYPENAME_PATTERN.test(options.name))
        throw new TypeError(`"${options.name}" is not a valid type name`);
      name = options.name;
    } else {
      name = target.name.match(EXTRACT_TYPENAME_PATTERN)?.[1] || target.name;
    }
    let metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target) as ComplexType.Metadata;
    if (!metadata) {
      metadata = {} as ComplexType.Metadata;
      Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
    }
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.name = name;
    // Merge options
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name', 'base', 'fields']));
  }
}
