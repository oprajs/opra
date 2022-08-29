import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { OpraSchema } from '../interfaces/opra-schema.js';

export type ComplexTypeMetadata =
    StrictOmit<OpraSchema.ComplexType, 'base' | 'ctor' | 'properties'>;

export type ComplexTypeDecoratorOptions = Partial<StrictOmit<ComplexTypeMetadata, 'kind'>>;

export function ComplexType(args?: ComplexTypeDecoratorOptions): ClassDecorator {
  return (target: Function): void => {
    const meta: ComplexTypeMetadata = {
      kind: 'ComplexType',
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(DATATYPE_METADATA, meta, target);
  };
}
