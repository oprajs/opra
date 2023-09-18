import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import type { ComplexType } from './complex-type.js';
import type { DataType } from './data-type.js';
import type { ApiField } from './field.js';

export class FieldClass {
  readonly owner: ComplexType;
  readonly origin?: ComplexType;
  readonly type: DataType;
  readonly name: string;
  description?: string;
  isArray?: boolean;
  default?: any;
  fixed?: string | number;
  required?: boolean;
  exclusive?: boolean;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;

  constructor(owner: ComplexType, init: ApiField.InitArguments) {
    Object.assign(this, init);
    this.owner = owner;
    this.origin = init.origin || owner;
  }

  exportSchema(): OpraSchema.Field {
    return omitUndefined({
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed,
      required: this.required,
      exclusive: this.exclusive,
      deprecated: this.deprecated,
      examples: this.examples
    }) satisfies OpraSchema.Field;
  }
}
