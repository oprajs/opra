import { Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeClass } from './complex-type-class.js';
import type { MappedType } from './mapped-type.js';
import type { UnionType } from './union-type.js';

export class MappedTypeClass extends ComplexTypeClass {
  override readonly kind: OpraSchema.DataType.Kind = OpraSchema.MappedType.Kind;
  readonly own: MappedType.OwnProperties;
  readonly base: ComplexType | UnionType | MappedType;
  readonly omit?: Field.Name[];
  readonly pick?: Field.Name[];

  constructor(document: ApiDocument, init: MappedType.InitArguments) {
    super(document, init);
    const own = this.own as Writable<MappedType.OwnProperties>
    own.pick = init.pick;
    own.omit = init.omit;
    this.kind = OpraSchema.MappedType.Kind;
    this.pick = own.pick;
    this.omit = own.omit;
    const isInheritedPredicate = getIsInheritedPredicateFn(init.pick, init.omit);
    for (const fieldName of this.fields.keys()) {
      if (!isInheritedPredicate(fieldName)) {
        this.fields.delete(fieldName);
      }
    }
  }

  override exportSchema(): any {
    const out = super.exportSchema() as unknown as OpraSchema.MappedType;
    Object.assign(out, omitUndefined({
      pick: this.own.pick,
      omit: this.own.omit,
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

