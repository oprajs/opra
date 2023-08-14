import * as vg from 'valgen';
import { ComplexType } from '../data-type/complex-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { MappedType } from '../data-type/mapped-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { UnionType } from '../data-type/union-type.js';

export interface GenerateDecoderOptions {
  omit?: string[];
  partial?: boolean;
}

export function generateCodec(
    type: ComplexType,
    codec: 'decode' | 'encode',
    options: GenerateDecoderOptions
): vg.Validator<any, any> {
  return _generateDecoder(type, codec, options)
}

export function _generateDecoder(
    type: ComplexType | MappedType | UnionType,
    codec: 'decode' | 'encode',
    options: GenerateDecoderOptions
): vg.Validator<any, any> {
  const schema: vg.ObjectSchema = {};
  for (const f of type.fields.values()) {
    let fn: vg.Validator<any, any> | undefined;
    if (f.type instanceof SimpleType || f.type instanceof EnumType) {
      fn = f.type[codec];
    } else if (f.type instanceof ComplexType || f.type instanceof MappedType || f.type instanceof UnionType) {
      fn = _generateDecoder(f.type, codec, options)
    }
    /* istanbul ignore next */
    if (!fn)
      throw new TypeError(`Can't generate codec for (${f.type})`);
    if (f.isArray)
      fn = vg.isArray(fn);
    schema[f.name] = !options.partial && f.required ? vg.required(fn) : vg.optional(fn);
  }
  return vg.isObject(schema, {
    ctor: (type as any).ctor,
    additionalFields: type.additionalFields ?? 'ignore',
    name: type.name,
    caseInSensitive: true,
  })
}
