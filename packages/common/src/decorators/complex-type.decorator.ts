import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DTO_METADATA } from '../constants';
import { OpraSchema } from '../interfaces/opra-schema';

export type ComplexTypeMetadata =
    StrictOmit<OpraSchema.ComplexType, 'base' | 'ctor' | 'properties'>;

export function ComplexType(args?: Partial<StrictOmit<ComplexTypeMetadata, 'kind'>>): ClassDecorator {
  return (target: Function): void => {
    const meta: ComplexTypeMetadata = {
      kind: 'ComplexType',
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(DTO_METADATA, meta, target);
  };
}
