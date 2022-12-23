import { toBoolean } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const BooleanType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'Simple true/false value',
  ctor: Boolean,
  parse(v: any): boolean | undefined {
    return toBoolean(v);
  },
  serialize(v: any): boolean | undefined {
    return toBoolean(v);
  }
};
