import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import type { ResourceDecorator } from './resource-decorator.js';

/**
 *
 * @class Parameter
 */
export class Parameter {
  protected _decoder: vg.Validator;
  protected _encoder: vg.Validator;
  readonly name: string;
  readonly type: DataType;
  description?: string;
  isArray?: boolean;
  default?: any;
  required?: boolean;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;

  constructor(init: Parameter.InitArguments) {
    this.type = init.type;
    this.name = init.name;
    this.description = init.description;
    this.isArray = init.isArray;
    this.default = init.default;
    this.required = init.required;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Endpoint.Parameter {
    return omitUndefined<OpraSchema.Endpoint.Parameter>({
      type: this.type.name ? this.type.name : this.type.exportSchema(options),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      required: this.required,
      deprecated: this.deprecated,
      examples: this.examples
    })
  }

  getDecoder(): vg.Validator {
    if (!this._decoder)
      this._decoder = this.generateCodec('decode');
    return this._decoder;
  }

  getEncoder(): vg.Validator {
    if (!this._encoder)
      this._encoder = this.generateCodec('encode');
    return this._encoder;
  }

  generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): vg.Validator {
    let fn = this.type.generateCodec(codec, options);
    if (this.isArray)
      fn = vg.isArray(fn);
    return !options?.partial && this.required ? vg.required(fn) : vg.optional(fn);
  }

}

export namespace Parameter {
  export interface InitArguments extends StrictOmit<ResourceDecorator.ParameterMetadata, 'type'> {
    name: string;
    type: DataType;
  }
}
