import { StrictOmit } from 'ts-gems';
import { ComplexType } from './complex-type.interface.js';
import { Field } from './field.interface.js';

export interface MappedType extends StrictOmit<ComplexType, 'kind'> {
  kind: MappedType.Kind;
  omit?: Field.Name[];
  pick?: Field.Name[];
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = 'MappedType';
}
