import type { IChildFieldQuery } from '../../interfaces/child-field-query.interface.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { ComplexType, Field } from '../data-type/complex-type.js';
import type { DataType } from '../data-type/data-type.js';
import type { CollectionResourceInfo } from '../resource/collection-resource-info.js';
import type { SingletonResourceInfo } from '../resource/singleton-resource-info.js';
import type { CollectionGetQuery } from './collection-get-query.js';
import type { SingletonGetQuery } from './singleton-get-query.js';

export type FieldGetQueryOptions = {
  pick?: string[];
  omit?: string[];
  include?: string[];
  castingType?: ComplexType;
}

export class FieldGetQuery implements IChildFieldQuery {
  readonly resource: CollectionResourceInfo | SingletonResourceInfo;
  readonly kind = 'FieldGetQuery';
  readonly method = 'get'
  readonly operation = 'read';
  readonly fieldName: string;
  readonly field?: Field;
  readonly path: string;
  readonly dataType: DataType;
  readonly parentType: ComplexType;
  pick?: string[];
  omit?: string[];
  include?: string[];
  child?: FieldGetQuery;

  constructor(readonly parent: CollectionGetQuery | SingletonGetQuery | FieldGetQuery,
              fieldName: string,
              options?: FieldGetQueryOptions
  ) {
    this.resource = parent.resource;
    const parentType = options?.castingType || parent.dataType;
    if (!parentType || !(parentType instanceof ComplexType))
      throw new TypeError(`Data type of parent query is not a ComplexType`);
    this.parentType = parentType;
    this.field = parentType.additionalFields
        ? parentType.fields.get(fieldName)
        : parentType.getField(fieldName);
    this.fieldName = this.field ? this.field.name : fieldName;
    this.dataType = this.resource.document.getDataType(this.field ? (this.field.type || 'string') : 'object');
    this.path = (parent instanceof FieldGetQuery
        ? parent.path + '.' : '') + this.fieldName;
    if (this.dataType instanceof ComplexType) {
      if (options?.pick)
        this.pick = normalizeFieldArray(this.resource.document, this.dataType, options.pick, this.path);
      if (options?.omit)
        this.omit = normalizeFieldArray(this.resource.document, this.dataType, options.omit, this.path);
      if (options?.include)
        this.include = normalizeFieldArray(this.resource.document, this.dataType, options.include, this.path);
    }
  }

}
