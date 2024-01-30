import { StrictOmit } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';

export namespace ApiParameter {
  export interface InitArguments extends StrictOmit<OpraSchema.Parameter, 'type'> {
    type: DataType;
    isBuiltin?: boolean;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Parameter, 'type'> {
    type?: TypeThunkAsync | string;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<DecoratorMetadata, 'name'>> {
  }

}

/**
 *
 * @class ApiParameter
 */
export class ApiParameter {
  protected _decoder: Validator;
  protected _encoder: Validator;
  readonly name: string | RegExp;
  readonly type: DataType;
  description?: string;
  isArray?: boolean;
  required?: boolean;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;
  readonly isBuiltin?: boolean;

  constructor(init: ApiParameter.InitArguments) {
    const name = String(init.name);
    if (name.startsWith('/')) {
      const i = name.lastIndexOf('/');
      const s = name.substring(1, i);
      let flags = name.substring(i + 1);
      if (!flags.includes('i')) flags += 'i';
      this.name = new RegExp(s, flags);
    } else this.name = name;
    this.type = init.type;
    this.description = init.description;
    this.isArray = init.isArray;
    this.required = init.required;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
    this.isBuiltin = init.isBuiltin;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Parameter {
    return omitUndefined<OpraSchema.Parameter>({
      name: this.name,
      type: this.type.name ? this.type.name : this.type.exportSchema(options),
      description: this.description,
      isArray: this.isArray,
      required: this.required,
      deprecated: this.deprecated,
      examples: this.examples
    })
  }

  getDecoder(): Validator {
    if (!this._decoder)
      this._decoder = this.generateCodec('decode');
    return this._decoder;
  }

  getEncoder(): Validator {
    if (!this._encoder)
      this._encoder = this.generateCodec('encode');
    return this._encoder;
  }

  generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): Validator {
    let fn = this.type.generateCodec(codec, options);
    if (this.isArray)
      fn = vg.pipe(vg.stringSplit(','), vg.isArray(fn));
    return !options?.partial && this.required ? vg.required(fn) : vg.optional(fn);
  }

}
