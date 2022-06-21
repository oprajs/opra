import "reflect-metadata";
import _ from 'lodash';
import { SCHEMA_METADATA } from '../constants';
import { OpraSchemaMetadata } from '../interfaces';

export function DtoSchema(
    args?: Partial<OpraSchemaMetadata>
): ClassDecorator {
  return (target: Function): void => {
    const meta: OpraSchemaMetadata = {
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(SCHEMA_METADATA, meta, target);
  };
}
