import { StrictOmit, Type } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { ApiNode } from '../api-node.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';

export namespace HttpKeyParameter {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.KeyParameter, 'type'> {
    type?: string | DataType;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Http.KeyParameter, 'type'> {
    type?: string | Type | EnumType.EnumObject;
    // enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<DecoratorMetadata, 'name'>> {
  }

}


/**
 *
 * @class ApiParameter
 */
export class HttpKeyParameter extends ApiNode {
  protected _decoder: Validator;
  protected _encoder: Validator;
  readonly name: string;
  type?: DataType;
  description?: string;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;

  constructor(parent: ApiNode, init: HttpKeyParameter.InitArguments) {
    super(parent);
    this.name = String(init.name);
    if (init.type) {
      if (init.type instanceof DataType) {
        this.type = init.type.isEmbedded ? init.type : this.findDataType(init.type.name!);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type.name!}) given for parameter "${this.name}" is not belong to this document scope`);
      } else {
        this.type = this.findDataType(init.type);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type}) given for parameter "${this.name}" could not be found in document scope`);
      }
    }
    this.description = init.description;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
  }

  toJSON(): OpraSchema.Http.KeyParameter {
    return omitUndefined<OpraSchema.Http.KeyParameter>({
      name: this.name,
      type: this.type?.name,
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
