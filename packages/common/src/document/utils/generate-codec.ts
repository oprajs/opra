import * as vg from 'valgen';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { MappedType } from '../data-type/mapped-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { UnionType } from '../data-type/union-type.js';

export interface GenerateDecoderOptions {
  omit?: string[];
  partial?: boolean;
}

export function generateCodec(
    type: DataType,
    codec: 'decode' | 'encode',
    options: GenerateDecoderOptions = {}
): vg.Validator {
  if (type instanceof SimpleType || type instanceof EnumType) {
    return type[codec];
  }
  const schema: vg.ObjectSchema = {};
  if (type instanceof ComplexType || type instanceof MappedType || type instanceof UnionType) {
    for (const f of type.fields.values()) {
      let fn = generateCodec(f.type, codec, options)
      /* istanbul ignore next */
      if (!fn)
        throw new TypeError(`Can't generate codec for (${f.type})`);
      if (f.isArray)
        fn = vg.isArray(fn);
      schema[f.name] = !options.partial && f.required ? vg.required(fn) : vg.optional(fn);
    }
    return vg.isObject(schema, {
      ctor: (type as any).ctor,
      additionalFields: type.additionalFields ?? false,
      name: type.name,
      caseInSensitive: true,
    })
  } else
      /* istanbul ignore next */
    throw new TypeError(`Unimplemented DataType class ${type.kind}`);
}
