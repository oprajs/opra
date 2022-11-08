import { OpraSchema } from '../../../opra-schema.definition.js';

const BufferConstructor = Object.getPrototypeOf(Buffer.from('')).constructor;

export const Base64BinaryType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'A stream of bytes, base64 encoded',
  ctor: BufferConstructor,
  parse(v: any): Buffer | undefined {
    return Buffer.from(v);
  },
  serialize(v: any): string | undefined {
    return Buffer.isBuffer(v) ? (v as Buffer).toString('base64') : undefined;
  }
};
