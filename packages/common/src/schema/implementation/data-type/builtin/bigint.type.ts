import { OpraSchema } from '../../../opra-schema.definition.js';

const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;

export const BigIntType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'BigInt number',
  ctor: BigIntConstructor,
  parse(v: any): bigint | undefined {
    return BigInt(v);
  },
  serialize(v: any): string | undefined {
    return String(v);
  }
};
