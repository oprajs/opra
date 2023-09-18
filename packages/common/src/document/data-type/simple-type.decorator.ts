import omit from 'lodash.omit';
import { OpraSchema } from '../../schema/index.js';
import { DATATYPE_METADATA, TYPENAME_PATTERN } from '../constants.js';
import type { SimpleType } from './simple-type.js';

export function SimpleTypeDecorator(options?: SimpleType.DecoratorOptions) {
  return function (target: Function) {
    let name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
    name = name.charAt(0).toLowerCase() + name.substring(1);
    const metadata: SimpleType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target) || ({} as any);
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.name = name;
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name']));
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target);
  }
}
