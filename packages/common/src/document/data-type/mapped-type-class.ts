import { omitUndefined } from '../../helpers/index.js';
import type { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeClass } from './complex-type-class.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type';

export class MappedTypeClass extends ComplexTypeClass {
  override readonly kind: OpraSchema.DataType.Kind = OpraSchema.MappedType.Kind;
  readonly own: MappedType.OwnProperties;
  readonly base: ComplexType | MixinType | MappedType;
  readonly omit?: Field.Name[];
  readonly pick?: Field.Name[];
  readonly partial?: Field.Name[] | boolean;

  constructor(node: ApiNode, init: MappedType.InitArguments) {
    super(node, init);
    if (init.pick)
      this.pick = init.pick;
    else if (init.omit)
      this.omit = init.omit;
    else this.partial = init.partial;
    const isInheritedPredicate = getIsInheritedPredicateFn(this.pick, this.omit);
    for (const fieldName of this.fields.keys()) {
      if (!isInheritedPredicate(fieldName)) {
        this.fields.delete(fieldName);
      }
      if (this.partial === true || (Array.isArray(this.partial) && this.partial.includes(fieldName))) {
        const f = this.fields.get(fieldName);
        if (f)
          f.required = false;
      }
    }
  }

  override toJSON(): any {
    const out = super.toJSON() as unknown as OpraSchema.MappedType;
    Object.assign(out, omitUndefined({
      pick: this.pick,
      omit: this.omit,
      partial: this.partial
    }));
    return out;
  }

}

export function getIsInheritedPredicateFn(pick?: Field.Name[], omit?: Field.Name[]) {
  const pickKeys = pick?.map(x => String(x).toLowerCase());
  const omitKeys = omit?.map(x => String(x).toLowerCase());
  return (propertyName: string): boolean => {
    if (omitKeys && omitKeys.includes(propertyName.toLowerCase()))
      return false;
    if (pickKeys)
      return pickKeys.includes(propertyName.toLowerCase());
    return true;
  };
}

