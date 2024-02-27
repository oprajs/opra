import { StrictOmit, Type } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { ApiElement } from './api-element.js';

export namespace ApiKeyParameter {
  export interface InitArguments extends StrictOmit<OpraSchema.KeyParameter, 'type'> {
    type?: DataType | string | Type;
    isBuiltin?: boolean;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.KeyParameter, 'type'> {
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
export class ApiKeyParameter extends ApiElement {
  protected _decoder: Validator;
  protected _encoder: Validator;
  readonly name: string;
  readonly type: DataType;
  description?: string;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;

  constructor(parent: ApiElement, init: ApiKeyParameter.InitArguments) {
    super(parent);
    this.name = String(init.name);
    if (init.type)
      this.type = init.type instanceof DataType
          ? init.type
          : this.document.getDataType(init.type);
    this.description = init.description;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
  }

  exportSchema(): OpraSchema.KeyParameter {
    return omitUndefined<OpraSchema.KeyParameter>({
      name: this.name,
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      description: this.description,
      deprecated: this.deprecated,
      examples: this.examples
    })
  }

  getDecoder(): Validator {
    if (!this._decoder) {
      const fn = this.type?.generateCodec('decode', {operation: 'write'}) || vg.isAny();
      this._decoder = vg.required(fn);
    }
    return this._decoder;
  }

  getEncoder(): Validator {
    if (!this._encoder) {
      const fn = this.type?.generateCodec('encode', {operation: 'read'}) || vg.isAny();
      this._encoder = vg.required(fn);
    }
    return this._encoder;
  }

}
