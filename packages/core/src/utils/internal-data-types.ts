import { Type } from 'ts-gems';
import { OpraSchema } from '@opra/schema';

export const primitiveDataTypeNames = ['boolean', 'number', 'string', 'null'];
export const builtinClassMap = new Map<Type, OpraSchema.DataType>();
export const internalDataTypes = new Map<string, OpraSchema.DataType>();

const internalDataTypeArray: OpraSchema.DataType[] = [
  {
    kind: 'SimpleType',
    name: 'boolean',
    type: 'boolean',
    description: 'Simple true/false value',
    ctor: Boolean
  },
  {
    kind: 'SimpleType',
    name: 'string',
    type: 'string',
    description: 'A sequence of characters',
    ctor: String
  },
  {
    kind: 'SimpleType',
    name: 'number',
    type: 'number',
    description: 'Both Integer as well as Floating-Point numbers',
    ctor: Number
  },
  {
    kind: 'SimpleType',
    name: 'integer',
    type: 'number',
    base: 'number',
    description: 'Integer number',
    ctor: Number
  },
  {
    kind: 'ComplexType',
    name: 'object',
    description: 'Object type with additional properties',
    additionalProperties: true,
    ctor: Object
  },

  {
    kind: 'SimpleType',
    name: 'date',
    type: 'string',
    description: 'Date',
    format: 'date',
    ctor: Date
  },
  {
    kind: 'SimpleType',
    name: 'date-time',
    type: 'string',
    description: 'Date time value',
    format: 'date-time',
    ctor: Date
  },
  {
    kind: 'SimpleType',
    name: 'time',
    type: 'string',
    description: 'Time value',
    format: 'time',
    ctor: String
  },
  {
    kind: 'SimpleType',
    name: 'buffer',
    type: 'string',
    description: 'Buffer value',
    format: 'base64',
    ctor: Buffer
  }
];

internalDataTypeArray.forEach(sch => {
  internalDataTypes.set(sch.name, sch);
  if (sch.ctor && !builtinClassMap.has(sch.ctor))
    builtinClassMap.set(sch.ctor, sch);
});
