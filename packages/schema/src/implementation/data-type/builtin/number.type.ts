import { toNumber } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const NumberType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'Both Integer as well as Floating-Point numbers',
  ctor: Number,
  parse(v: any): number | undefined {
    return toNumber(v);
  },
  serialize(v: any): number | undefined {
    return toNumber(v);
  }
};
