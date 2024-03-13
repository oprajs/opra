import { Validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node.js';
import { DATATYPE_METADATA } from '../constants.js';
import { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';

export class EnumTypeClass extends DataType {
  readonly enumObject?: object;
  readonly kind = OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly values: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;
  readonly ownValues: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;
  readonly decode: Validator;
  readonly encode: Validator;

  constructor(node: ApiNode, init: EnumType.InitArguments) {
    super(node, init);
    this.enumObject = init.enumObject;
    this.base = init.base;
    this.ownValues = {...init.values};
    this.values = {...this.base?.values, ...this.ownValues};
    this.decode = vg.isEnum(Object.keys(this.values));
    this.encode = vg.isEnum(Object.keys(this.values));
  }

  isTypeOf(t: object): boolean {
    return t[DATATYPE_METADATA] &&
        t[DATATYPE_METADATA] === this.enumObject?.[DATATYPE_METADATA];
  }

  toJSON(): OpraSchema.EnumType {
    const out = super.toJSON() as OpraSchema.EnumType;
    out.values = {};
    Object.entries(this.values).forEach(([k, i]) => {
      out.values[k] = omitUndefined({key: i.key, description: i.description})
    })
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): Validator {
    if (codec === 'encode')
      return this.encode;
    else return this.decode;
  }

}
