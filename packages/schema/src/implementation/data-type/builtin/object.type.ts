import { OpraSchema } from '../../../opra-schema.definition.js';

export const ObjectType: OpraSchema.ComplexType = {
  kind: 'ComplexType',
  description: 'A non modelled object',
  ctor: Object,
  additionalFields: true,
  parse(v: any): string | undefined {
    return v;
  },
  serialize(v: any): string | undefined {
    return v;
  }
};
