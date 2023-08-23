import { Type, Writable } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import type { ApiField } from './field.js';
import { MappedType } from './mapped-type.js';
import type { UnionType } from './union-type.js';

export class UnionTypeClass extends DataType {
  readonly kind = OpraSchema.UnionType.Kind;
  readonly own: UnionType.OwnProperties;
  readonly types: (ComplexType | UnionType | MappedType)[];
  readonly additionalFields?: boolean | vg.Validator | 'error'
  readonly fields: ResponsiveMap<ApiField>;

  constructor(document: ApiDocument, init: UnionType.InitArguments) {
    super(document, init);
    this.fields = new ResponsiveMap();
    const own = this.own as Writable<UnionType.OwnProperties>
    own.types = [];

    const UnionType: Type<UnionType> = Object.getPrototypeOf(this).constructor;
    for (const base of init.types) {
      if (!(base instanceof ComplexType || base instanceof UnionType || base instanceof MappedType))
        throw new TypeError(`${OpraSchema.UnionType.Kind} shall contain ${OpraSchema.ComplexType.Kind}, ` +
            `${OpraSchema.UnionType.Kind} of ${OpraSchema.MappedType.Kind} types.`);
      own.types.push(base);
      if (base.additionalFields)
        this.additionalFields = base.additionalFields;
      this.fields.setAll(base.fields);
    }

    this.types = [...own.types];
  }

  exportSchema(): OpraSchema.UnionType {
    const out = super.exportSchema() as OpraSchema.UnionType;
    Object.assign(out, omitUndefined({
      types: this.own.types.map(t => t.name ? t.name : t.exportSchema())
    }));
    return out;
  }

}
