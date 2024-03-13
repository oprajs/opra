import omit from 'lodash.omit';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA, EXTRACT_TYPENAME_PATTERN, TYPENAME_PATTERN } from '../../constants.js';
import type { SimpleType } from '../simple-type.js';

export function SimpleTypeDecorator(options?: SimpleType.DecoratorOptions) {
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
