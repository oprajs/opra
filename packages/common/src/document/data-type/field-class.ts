import { Type } from 'ts-gems';
import { isUndefined, Validator, vg } from 'valgen';
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
  readonly designType?: Type;
  description?: string;
  isArray?: boolean;
  default?: any;
  fixed?: string | number | boolean;
  required?: boolean;
  readonly?: boolean;
  writeonly?: boolean;
  exclusive?: boolean;
  translatable?: boolean;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;
  pattern?: RegExp;
  partialUpdate?: boolean;

  constructor(owner: ComplexType, init: ApiField.InitArguments) {
    this.owner = owner;
    this.origin = init.origin || owner;
    this.type = init.type;
    this.designType = init.designType;
    this.name = init.name;
    this.description = init.description;
    this.isArray = init.isArray;
    this.default = init.default;
    this.fixed = init.fixed;
    this.required = init.required;
    this.readonly = init.readonly;
    this.writeonly = init.writeonly;
    this.exclusive = init.exclusive;
    this.translatable = init.translatable;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
    this.pattern = init.pattern ?
        (init.pattern instanceof RegExp ? init.pattern : new RegExp(init.pattern)) : undefined;
    this.partialUpdate = init.partialUpdate;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Field {
    const isEmbedded = !this.type?.name ||
        (this.type?.kind === 'ComplexType' && this.type.isEmbedded);
    return omitUndefined({
      type: this.type
          ? (isEmbedded ? this.type.exportSchema(options) : this.type.name)
          : undefined,
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed,
      required: this.required,
      readonly: this.readonly,
      writeonly: this.writeonly,
      exclusive: this.exclusive,
      translatable: this.translatable,
      deprecated: this.deprecated,
      examples: this.examples,
      pattern: this.pattern ? String(this.pattern) : undefined,
      partialUpdate: this.partialUpdate,
    }) as OpraSchema.Field;
  }

  generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): Validator {
    if (options?.operation === 'read' && this.writeonly)
      return isUndefined
    if (options?.operation === 'write' && this.readonly)
      return isUndefined
    let fn = this.type.generateCodec(codec, {
      ...options,
      designType: this.designType,
      partial: options?.partial && (this.partialUpdate || !this.isArray)
    });
    if (this.pattern)
      fn = vg.allOf(fn, vg.isRegExp(this.pattern));
    if (this.isArray)
      fn = vg.isArray(fn);
    return !options?.partial && this.required ? vg.required(fn) : vg.optional(fn);
  }
}
