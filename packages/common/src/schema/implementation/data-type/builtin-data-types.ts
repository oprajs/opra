import { ResponsiveMap } from '../../../helpers/responsive-map.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { AnyType } from './builtin/any.type.js';
import { Base64BinaryType } from './builtin/base64-binary.type.js';
import { BigIntType } from './builtin/bigint.type.js';
import { BooleanType } from './builtin/boolean.type.js';
import { DateType } from './builtin/date.type.js';
import { DateStringType } from './builtin/date-string.type.js';
import { GuidType } from './builtin/guid.type.js';
import { IntegerType } from './builtin/integer.type.js';
import { NumberType } from './builtin/number.type.js';
import { ObjectType } from './builtin/object.type.js';
import { StringType } from './builtin/string.type.js';

const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;
const BufferConstructor = Object.getPrototypeOf(Buffer.from('')).constructor;

export const builtInTypes = new ResponsiveMap<string, OpraSchema.DataType>();
builtInTypes.set('any', AnyType);
builtInTypes.set('base64Binary', Base64BinaryType);
builtInTypes.set('bigint', BigIntType);
builtInTypes.set('boolean', BooleanType);
builtInTypes.set('date', DateType);
builtInTypes.set('dateString', DateStringType);
builtInTypes.set('guid', GuidType);
builtInTypes.set('integer', IntegerType);
builtInTypes.set('number', NumberType);
builtInTypes.set('object', ObjectType);
builtInTypes.set('string', StringType);

export const primitiveClasses = new Map<Function, string>();
primitiveClasses.set(Boolean, 'boolean');
primitiveClasses.set(String, 'string');
primitiveClasses.set(Number, 'number');
primitiveClasses.set(Date, 'date');
primitiveClasses.set(BigIntConstructor, 'bigint');
primitiveClasses.set(BufferConstructor, 'base64Binary');
primitiveClasses.set(Object, 'object');
