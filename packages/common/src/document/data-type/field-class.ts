import * as vg from 'valgen';
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
  readonly?: boolean;
  writeonly?: boolean;
  exclusive?: boolean;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;

  constructor(owner: ComplexType, init: ApiField.InitArguments) {
    this.owner = owner;
    this.origin = init.origin || owner;
    this.type = init.type;
    this.name = init.name;
    this.description = init.description;
    this.isArray = init.isArray;
    this.default = init.default;
    this.fixed = init.fixed;
    this.required = init.required;
    this.readonly = init.readonly;
    this.writeonly = init.writeonly;
    this.exclusive = init.exclusive;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Field {
    return omitUndefined({
      type: this.type.name ? this.type.name : this.type.exportSchema(options),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed,
      required: this.required,
      readonly: this.readonly,
      writeonly: this.writeonly,
      exclusive: this.exclusive,
      deprecated: this.deprecated,
      examples: this.examples
    }) satisfies OpraSchema.Field;
  }

  generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): vg.Validator {
    if (options?.operation === 'read' && this.writeonly)
      return vg.isUndefined()
    if (options?.operation === 'write' && this.readonly)
      return vg.isUndefined()
    let fn = this.type.generateCodec(codec, options);
    if (this.isArray)
      fn = vg.isArray(fn);
    return !options?.partial && this.required ? vg.required(fn) : vg.optional(fn);
  }
}
