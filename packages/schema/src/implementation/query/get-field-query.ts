import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { ComplexType, Field } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EntityResource } from '../resource/entity-resource.js';
import type { OpraGetInstanceQuery } from './get-instance-query.js';

export type OpraGetPropertyQueryOptions = StrictOmit<OpraSchema.GetFieldQuery,
    'method' | 'scope' | 'operation' | 'fieldName' | 'nested'> &
    {
      nested?: OpraGetFieldQuery;
    }

export class OpraGetFieldQuery implements OpraSchema.GetFieldQuery {
  readonly kind = 'GetFieldQuery';
  readonly method = 'get'
  readonly scope = 'field';
  readonly operation = 'read';
  readonly resource: EntityResource;
  readonly field: Field;
  readonly path: string;
  readonly dataType: DataType;
  pick?: string[];
  omit?: string[];
  include?: string[];
  nested?: OpraGetFieldQuery;

  constructor(readonly parent: OpraGetInstanceQuery | OpraGetFieldQuery,
              fieldName: string,
              options?: OpraGetPropertyQueryOptions
  ) {
    this.resource = parent.resource;
    if (!(parent.dataType instanceof ComplexType))
      throw new TypeError(`"${parent.dataType}}" is not a ComplexType and has no fields.`);
    this.field = parent.dataType.getField(fieldName);
    this.dataType = this.resource.owner.getDataType(this.field.type || 'string');
    this.path = (parent instanceof OpraGetFieldQuery
        ? parent.path + '.' : '') + this.field.name;
    this.nested = options?.nested;
    if (this.dataType instanceof ComplexType) {
      if (options?.pick)
        this.pick = normalizeFieldArray(this.resource.owner, this.dataType, options.pick, this.path);
      if (options?.omit)
        this.omit = normalizeFieldArray(this.resource.owner, this.dataType, options.omit, this.path);
      if (options?.include)
        this.include = normalizeFieldArray(this.resource.owner, this.dataType, options.include, this.path);
    }
  }

  get fieldName(): string {
    return this.field.name;
  }

  get parentType(): ComplexType {
    return this.parent.dataType as ComplexType;
  }


}
