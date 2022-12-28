import { omit } from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { ComplexTypeMetadata } from '../interfaces/data-type.metadata.js';

export type ComplexTypeDecoratorOptions =
    Partial<StrictOmit<ComplexTypeMetadata, 'name' | 'kind' | 'ctor' | 'fields' | 'extends'>> & {
  name?: string;
};

const NAME_PATTERN = /^(.*)Type$/;

export function OprComplexType(options?: ComplexTypeDecoratorOptions): ClassDecorator {
  return (target: Function): void => {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: ComplexTypeMetadata = {
      kind: 'ComplexType',
      name,
    };
    Object.assign(meta, omit(options, Object.keys(meta)));

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
