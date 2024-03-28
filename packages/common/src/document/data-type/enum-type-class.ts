import { isAny, Validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node.js';
import { DATATYPE_METADATA, DECODER, ENCODER } from '../constants.js';
import { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';

export class EnumTypeClass extends DataType {
  readonly kind = OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly instance: object;
  readonly own: EnumType.OwnProperties;
  readonly values: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;

  constructor(node: ApiNode, init: EnumType.InitArguments) {
    super(node, init);
    this.base = init.base;
    if (init.instance)
      this.instance = init.instance;
    this.own.values = {...init.values};
    this.values = {...this.base?.values, ...this.own.values};
  }

  isTypeOf(t: object): boolean {
    return t[DATATYPE_METADATA] &&
        t[DATATYPE_METADATA] === this.instance?.[DATATYPE_METADATA];
  }

  toJSON(): OpraSchema.EnumType {
    const out = super.toJSON() as OpraSchema.EnumType;
    out.values = {};
    Object.entries(this.own.values).forEach(([k, i]) => {
      out.values[k] = omitUndefined({key: i.key, description: i.description})
    })
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): Validator {
    return vg.isEnum(Object.keys(this.instance));
  }

}
