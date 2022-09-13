import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { OpraSchema } from '../interfaces/opra-schema.js';

export type ApiEntityMetadata =
    StrictOmit<OpraSchema.EntityType, 'base' | 'ctor' | 'properties' | 'primaryKey'> &
    Partial<Pick<OpraSchema.EntityType, 'primaryKey'>>;

export type ApiEntityDecoratorOptions = Partial<StrictOmit<ApiEntityMetadata, 'kind'>>;

export function ApiEntityType(args?: ApiEntityDecoratorOptions): ClassDecorator {
  return (target: Function): void => {
    const meta: ApiEntityMetadata = {
      kind: 'EntityType',
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(DATATYPE_METADATA, meta, target);
  };
}
