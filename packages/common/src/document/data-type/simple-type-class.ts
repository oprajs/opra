import * as vg from 'valgen';
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
  readonly decode: vg.Validator;
  readonly encode: vg.Validator;

  constructor(document: ApiDocument, init: SimpleType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.decode = init.decoder || init.base?.decode || vg.isAny();
    this.encode = init.encoder || init.base?.encode || vg.isAny();
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.SimpleType {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.exportSchema(options) as OpraSchema.SimpleType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema(options)) : undefined,
      decode: !options?.webSafe ? this.decode : undefined,
      encode: !options?.webSafe ? this.encode : undefined
    }));
    return out;
  }

  generateCodec(codec: 'decode' | 'encode'): vg.Validator {
    if (codec === 'encode')
      return this.encode;
    else return this.decode;
  }

}
