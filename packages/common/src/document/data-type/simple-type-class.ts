import { isAny, Validator } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { DataType } from './data-type.js';
import type { SimpleType } from './simple-type.js';

/**
 * @class SimpleType
 */
export class SimpleTypeClass extends DataType {
  readonly kind = OpraSchema.SimpleType.Kind
  readonly base?: SimpleType;
  readonly own: SimpleType.OwnProperties;
  readonly decode: Validator;
  readonly encode: Validator;

  constructor(node: ApiNode, init: SimpleType.InitArguments) {
    super(node, init);
    this.base = init.base;
    this.decode = init.decoder || init.base?.decode || isAny;
    this.encode = init.encoder || init.base?.encode || isAny;
  }

  toJSON(): OpraSchema.SimpleType {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.toJSON() as OpraSchema.SimpleType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.toJSON()) : undefined,
    }));
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): Validator {
    if (codec === 'encode')
      return this.encode;
    else return this.decode;
  }

}
