import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { generateCodec } from '../utils/generate-codec.js';
import type { ResourceDecorator } from './resource.decorator.js';

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
    Object.assign(this, init);
  }

  exportSchema(): OpraSchema.Endpoint.Parameter {
    return omitUndefined<OpraSchema.Endpoint.Parameter>({
      type: this.type.name ? this.type.name : this.type.exportSchema(),
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
      this._decoder = generateCodec(this.type, 'decode');
    return this._decoder;
  }

  getEncoder(): vg.Validator {
    if (!this._encoder)
      this._encoder = generateCodec(this.type, 'encode');
    return this._encoder;
  }

}

export namespace Parameter {
  export interface InitArguments extends StrictOmit<ResourceDecorator.ParameterMetadata, 'type'> {
    type: DataType;
  }
}
