import { Writable } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import type { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import type { ApiField } from './field.js';
import type { MappedType } from './mapped-type.js';

export class MappedTypeClass extends DataType {
  readonly kind = OpraSchema.MappedType.Kind;
  readonly own: MappedType.OwnProperties;
  readonly type: ComplexType;
  readonly additionalFields?: boolean | vg.Validator | 'error';
  readonly fields: ResponsiveMap<ApiField>;
  readonly omit?: Field.Name[];
  readonly pick?: Field.Name[];

  constructor(document: ApiDocument, init: MappedType.InitArguments) {
    super(document, init);
    const own = this.own as Writable<MappedType.OwnProperties>
    own.pick = init.pick;
    own.omit = init.omit;
    this.kind = OpraSchema.MappedType.Kind;
    this.type = init.type;
    this.pick = own.pick;
    this.omit = own.omit;
    this.fields = new ResponsiveMap();
    this.additionalFields = this.type.additionalFields;
    const isInheritedPredicate = getIsInheritedPredicateFn(init.pick, init.omit);
    for (const [elemName, elem] of this.type.fields.entries()) {
      if (isInheritedPredicate(elemName))
        this.fields.set(elemName, elem);
    }
  }

  exportSchema(): OpraSchema.MappedType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.MappedType;
    Object.assign(out, omitUndefined({
      type: this.type.name ? this.type.name : this.type.exportSchema(),
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

