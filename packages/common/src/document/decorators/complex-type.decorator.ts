import { omit } from '@jsopen/objects';
import { OpraSchema } from '../../schema/index.js';
import { CLASS_NAME_PATTERN, DATATYPE_METADATA } from '../constants.js';
import type { ComplexType } from '../data-type/complex-type';

export function ComplexTypeDecorator(options?: ComplexType.Options) {
  return function (target: Function) {
    let name: string | undefined;
    if (!options?.embedded) {
      if (options?.name) {
        if (!CLASS_NAME_PATTERN.test(options.name))
          throw new TypeError(`"${options.name}" is not a valid type name`);
        name = options.name;
      } else {
        name = target.name;
      }
    }
    let metadata = Reflect.getOwnMetadata(
      DATATYPE_METADATA,
      target,
    ) as ComplexType.Metadata;
    if (!metadata) {
      metadata = {} as ComplexType.Metadata;
      Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
    }
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.name = name;
    // Merge options
    if (options) Object.assign(metadata, omit(options!, ['name']));
  };
}
