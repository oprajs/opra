import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';

export class EnumTypeClass extends DataType {
  readonly kind = OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly values: Record<string, string | number>;
  readonly meanings: Record<string, string>;
  readonly ownValues: Record<string, string | number>;
  readonly ownMeanings: Record<string, string>;
  readonly decode: vg.Validator<any, any>;
  readonly encode: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: EnumType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.ownValues = init.values;
    this.ownMeanings = init.meanings || {};
    this.values = {...this.base?.values, ...this.ownValues};
    this.meanings = {...this.base?.meanings, ...this.ownMeanings};
    this.decode = vg.isEnum(Object.values(this.values));
    this.encode = vg.isEnum(Object.values(this.values));
  }

  exportSchema(): OpraSchema.EnumType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.EnumType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      values: this.ownValues,
      meanings: this.ownMeanings
    }));
    return out;
  }

}
