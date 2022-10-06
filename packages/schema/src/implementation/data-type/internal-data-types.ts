import { toBoolean, toDate, toInt, toNumber, toString } from 'putil-varhelpers';
import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/responsive-map.js';
import { OpraSchema } from '../../opra-schema.js';

const internalDataTypeArray: OpraSchema.DataType[] = [
  {
    kind: 'SimpleType',
    name: 'boolean',
    type: 'boolean',
    description: 'Simple true/false value',
    ctor: Boolean,
    parse: (v) => toBoolean(v)
  },
  {
    kind: 'SimpleType',
    name: 'string',
    type: 'string',
    description: 'A sequence of characters',
    ctor: String,
    parse: (v) => toString(v)
  },
  {
    kind: 'SimpleType',
    name: 'number',
    type: 'number',
    description: 'Both Integer as well as Floating-Point numbers',
    ctor: Number,
    parse: (v) => toNumber(v)
  },
  {
    kind: 'SimpleType',
    name: 'integer',
    type: 'number',
    description: 'Integer number',
    ctor: Number,
    parse: (v) => toInt(v)
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
    ctor: Date,
    parse: (v) => toDate(v)
  },
  {
    kind: 'SimpleType',
    name: 'date-time',
    type: 'string',
    description: 'Date time value',
    format: 'date-time',
    ctor: Date,
    parse: (v) => toDate(v)
  },
  {
    kind: 'SimpleType',
    name: 'time',
    type: 'string',
    description: 'Time value',
    format: 'time',
    ctor: String,
    parse: (v) => toString(v)
  },
  {
    kind: 'SimpleType',
    name: 'buffer',
    type: 'string',
    description: 'Buffer value',
    format: 'base64',
    ctor: Buffer,
    parse: (v) => Buffer.from(v)
  }
];

export const primitiveDataTypeNames = ['boolean', 'number', 'string', 'null'];
export const builtinClassMap = new Map<Type, OpraSchema.DataType>();
export const internalDataTypes = new ResponsiveMap<string, OpraSchema.DataType>();

internalDataTypeArray.forEach(sch => {
  internalDataTypes.set(sch.name, sch);
  if (sch.ctor && !builtinClassMap.has(sch.ctor))
    builtinClassMap.set(sch.ctor, sch);
});

