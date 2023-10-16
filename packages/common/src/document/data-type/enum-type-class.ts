import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA } from '../constants.js';
import { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';

export class EnumTypeClass extends DataType {
  readonly enumObject?: object;
  readonly kind = OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly values: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;
  readonly ownValues: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;
  readonly decode: vg.Validator;
  readonly encode: vg.Validator;

  constructor(document: ApiDocument, init: EnumType.InitArguments) {
    super(document, init);
    this.enumObject = init.enumObject;
    this.base = init.base;
    this.ownValues = {...init.values};
    this.values = {...this.base?.values, ...this.ownValues};
    this.decode = vg.isEnum(Object.keys(this.values));
    this.encode = vg.isEnum(Object.keys(this.values));
  }

  isTypeOf(t: object): boolean {
    return t[DATATYPE_METADATA] === this.enumObject?.[DATATYPE_METADATA];
  }

  exportSchema(): OpraSchema.EnumType {
    const out = super.exportSchema() as OpraSchema.EnumType;
    out.values = {};
    Object.entries(this.values).forEach(([k, i]) => {
      out.values[k] = omitUndefined({key: i.key, description: i.description})
    })
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): vg.Validator {
    if (codec === 'encode')
      return this.encode;
    else return this.decode;
  }

}
