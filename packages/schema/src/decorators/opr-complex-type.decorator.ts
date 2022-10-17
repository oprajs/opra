import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { ComplexTypeMetadata } from '../interfaces/metadata/data-type.metadata.js';

export type ComplexTypeDecoratorOptions =
    Partial<StrictOmit<ComplexTypeMetadata, 'kind' | 'ctor' | 'fields' | 'extends'>>;

export function OprComplexType(args?: ComplexTypeDecoratorOptions): ClassDecorator {
  return (target: Function): void => {
    const meta: ComplexTypeMetadata = {
      kind: 'ComplexType',
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));

    const base = Object.getPrototypeOf(target);
    const baseMeta = Reflect.getMetadata(DATATYPE_METADATA, base);
    if (baseMeta) {
      if (baseMeta.additionalFields && meta.additionalFields == null)
        meta.additionalFields = true;
      meta.extends = [{
        type: base
      }];
    }

    Reflect.defineMetadata(DATATYPE_METADATA, meta, target);
  };
}
