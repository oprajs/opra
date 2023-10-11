import { Type, Writable } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from './complex-type.js';
import { MappedType } from './mapped-type.js';
import type { UnionType } from './union-type.js';

export class UnionTypeClass extends ComplexType {
  readonly kind: OpraSchema.DataType.Kind = OpraSchema.UnionType.Kind;
  readonly own: UnionType.OwnProperties;
  readonly types: (ComplexType | UnionType | MappedType)[];

  constructor(document: ApiDocument, init: UnionType.InitArguments) {
    super(document, init);
    const own = this.own as Writable<UnionType.OwnProperties>
    own.types = [];
    const UnionType: Type<UnionType> = Object.getPrototypeOf(this).constructor;
    for (const base of init.types) {
      if (!(base instanceof ComplexType || base instanceof UnionType || base instanceof MappedType))
        throw new TypeError(`${OpraSchema.UnionType.Kind} shall contain ${OpraSchema.ComplexType.Kind}, ` +
            `${OpraSchema.UnionType.Kind} of ${OpraSchema.MappedType.Kind} types.`);
      own.types.push(base);
      if (base.additionalFields === true && this.additionalFields !== true) {
        // @ts-ignore
        this.additionalFields = true;
      } else if (base.additionalFields === 'error' && !this.additionalFields) {
        // @ts-ignore
        this.additionalFields = 'error';
      }
      this.fields.setAll(base.fields);
    }
    this.types = [...own.types];
  }

  // @ts-ignore
  exportSchema(): any {
    const out = super.exportSchema() as unknown as OpraSchema.UnionType;
    out.types = this.own.types.map(t => t.name ? t.name : t.exportSchema());
    return out;
  }

}
