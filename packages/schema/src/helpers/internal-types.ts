import { Type } from 'ts-gems';
import { OpraSchema } from '../interfaces/opra-schema.interface.js';
import { ResponsiveMap } from './responsive-map.js';

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
    description: 'Integer number',
    ctor: Number
  },
  {
    kind: 'ComplexType',
    name: 'object',
    description: 'Object type with additional fields',
    additionalFields: true,
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

export const primitiveDataTypeNames = ['boolean', 'number', 'string', 'null'];
export const builtinClassMap = new Map<Type, string>();
export const internalDataTypes = new ResponsiveMap<string, OpraSchema.DataType>();

internalDataTypeArray.forEach(sch => {
  internalDataTypes.set(sch.name, sch);
  if (sch.ctor && !builtinClassMap.has(sch.ctor))
    builtinClassMap.set(sch.ctor, sch.name);
});

