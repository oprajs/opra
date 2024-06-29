import { Type } from 'ts-gems';
import { inheritPropertyInitializers, mergePrototype } from '../../../helpers/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA } from '../../constants.js';
import type { DataType } from '../data-type';
import { MappedType } from '../mapped-type.js';
import { getIsInheritedPredicateFn } from './get-is-inherited-predicate-fn.js';

export function createMappedClass(source: string | Type, config: any, options?: DataType.Options) {
  const isInheritedPredicate = getIsInheritedPredicateFn(config.pick as any, config.omit as any);
  const sourceName = typeof source === 'string' ? source.charAt(0).toUpperCase() + source.substring(1) : source.name;
  const className = options?.name || sourceName + 'Mapped';
  const MappedClass = {
    [className]: class {
      constructor() {
        if (typeof source === 'function') inheritPropertyInitializers(this, source, isInheritedPredicate);
      }
    },
  }[className];

  if (typeof source === 'function') mergePrototype(MappedClass.prototype, source.prototype);

  if (typeof source === 'function') {
    const m = Reflect.getOwnMetadata(DATATYPE_METADATA, source) as OpraSchema.DataType;
    if (!m) throw new TypeError(`Class "${source}" doesn't have datatype metadata information`);
    if (
      !(
        m.kind === OpraSchema.ComplexType.Kind ||
        m.kind === OpraSchema.MappedType.Kind ||
        m.kind === OpraSchema.MixinType.Kind
      )
    ) {
      throw new TypeError(`Class "${source}" is not a ${OpraSchema.ComplexType.Kind}`);
    }
  }

  const metadata: MappedType.Metadata = {
    ...options,
    kind: 'MappedType',
    base: source,
  };
  if (config.pick) metadata.pick = config.pick as any;
  if (config.omit) metadata.omit = config.omit as any;
  if (config.partial) metadata.partial = config.partial as any;
  if (config.required) metadata.required = config.required as any;
  Reflect.defineMetadata(DATATYPE_METADATA, metadata, MappedClass);

  if (typeof source === 'function') {
    MappedType._applyMixin(MappedClass, source, {
      ...config,
      isInheritedPredicate,
    });
  }
  return MappedClass as any;
}
