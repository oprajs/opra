import omit from 'lodash.omit';
import { OpraSchema } from '../../schema/index.js';
import { DATATYPE_METADATA, TYPENAME_PATTERN } from '../constants.js';
import type { ComplexType } from './complex-type.js';

export function ComplexTypeDecorator(options?: ComplexType.DecoratorOptions) {
  return function (target: Function) {
    const name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
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
