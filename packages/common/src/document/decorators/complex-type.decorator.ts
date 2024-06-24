import omit from 'lodash.omit';
import { OpraSchema } from '../../schema/index.js';
import { CLASS_NAME_PATTERN, DATATYPE_METADATA, EXTRACT_TYPENAME_PATTERN } from '../constants.js';
import type { ComplexType } from '../data-type/complex-type';

export function ComplexTypeDecorator(options?: ComplexType.Options) {
  return function (target: Function) {
    let name: string | undefined;
    if (!options?.embedded) {
      if (options?.name) {
        if (!CLASS_NAME_PATTERN.test(options.name)) throw new TypeError(`"${options.name}" is not a valid type name`);
        name = options.name;
      } else {
        name = target.name.match(EXTRACT_TYPENAME_PATTERN)?.[1] || target.name;
      }
    }
    let metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target) as ComplexType.Metadata;
    if (!metadata) {
      metadata = {} as ComplexType.Metadata;
      Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
    }
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.name = name;
    // Merge options
    if (options) Object.assign(metadata, omit(options, ['kind', 'name', 'base', 'fields']));
  };
}
