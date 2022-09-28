import { StrictOmit } from 'ts-gems';
import { DATATYPE_METADATA } from '../constants.js';
import { EntityTypeMetadata } from '../interfaces/metadata/data-type.metadata.js';
import { OprComplexType } from './opr-complex-type.decorator.js';

export type OprEntityOptions =
    Partial<StrictOmit<EntityTypeMetadata, 'kind' | 'ctor' | 'fields' | 'extends'>>;

export function OprEntity(args?: OprEntityOptions): ClassDecorator {
  return (target: Function): void => {
    OprComplexType(args)(target);
    const meta = Reflect.getMetadata(DATATYPE_METADATA, target);
    meta.kind = 'EntityType';
  };
}
