import { toString } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const DateStringType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'A date, date-time or partial date in string format',
  ctor: String,
  parse(v: any): string | undefined {
    return toString(v);
  },
  serialize(v: any): string | undefined {
    return toString(v);
  }
};
