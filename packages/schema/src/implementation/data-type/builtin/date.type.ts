import { toDate } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const DateType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'A date, date-time or partial date',
  ctor: String,
  parse(v: any): Date | undefined {
    return toDate(v);
  },
  serialize(v: any): string | undefined {
    return String(v);
  }
};

