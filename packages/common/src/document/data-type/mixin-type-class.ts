import { Type, Writable } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ComplexType } from './complex-type.js';
import { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type';

export class MixinTypeClass extends ComplexType {
  readonly kind: OpraSchema.DataType.Kind = OpraSchema.MixinType.Kind;
  readonly own: MixinType.OwnProperties;
  readonly types: (ComplexType | MixinType | MappedType)[];

  constructor(document: ApiDocument, init: MixinType.InitArguments) {
    super(document, init);
    const own = this.own as Writable<MixinType.OwnProperties>
    own.types = [];
    const MixinType: Type<MixinType> = Object.getPrototypeOf(this).constructor;
    for (const base of init.types) {
      if (!(base instanceof ComplexType || base instanceof MixinType || base instanceof MappedType))
        throw new TypeError(`${OpraSchema.MixinType.Kind} shall contain ${OpraSchema.ComplexType.Kind}, ` +
            `${OpraSchema.MixinType.Kind} of ${OpraSchema.MappedType.Kind} types.`);
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
    const out = super.exportSchema() as unknown as OpraSchema.MixinType;
    out.types = this.own.types.map(t => t.name ? t.name : t.exportSchema());
    return out;
  }

}
