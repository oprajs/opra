import { OpraSchema } from '@opra/common';

export const builtinClassMap = new Map();
builtinClassMap.set(Boolean, 'boolean');
builtinClassMap.set(Number, 'number');
builtinClassMap.set(String, 'string');
builtinClassMap.set(Buffer, 'buffer');

export const primitiveDataTypeNames = ['boolean', 'number', 'integer', 'string'];
export const internalDataTypes = new Map<string, OpraSchema.DataType>();

const internalDataTypeArray: OpraSchema.DataType[] = [
  {
    kind: 'SimpleType',
    name: 'boolean',
    type: 'boolean',
    description: 'Simple true/false value'
  },
  {
    kind: 'SimpleType',
    name: 'number',
    type: 'number',
    description: 'Both Integer as well as Floating-Point numbers'
  },
  {
    kind: 'SimpleType',
    name: 'string',
    type: 'string',
    description: 'A sequence of characters'
  },
  {
    kind: 'ComplexType',
    name: 'object',
    description: 'Object type with additional properties',
    additionalProperties: true
  },
  {
    kind: 'SimpleType',
    name: 'integer',
    type: 'number',
    base: 'number',
    description: 'Integer number'
  }
];
internalDataTypeArray.forEach(sch => internalDataTypes.set(sch.name, sch));
