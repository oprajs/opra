import { isAny, Validator } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
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

  constructor(document: ApiDocument, init: SimpleType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.decode = init.decoder || init.base?.decode || isAny;
    this.encode = init.encoder || init.base?.encode || isAny;
  }

  exportSchema(): any {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.exportSchema() as OpraSchema.SimpleType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
    }));
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): Validator {
    if (codec === 'encode')
      return this.encode;
    else return this.decode;
  }

}
