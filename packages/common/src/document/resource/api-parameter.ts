import { StrictOmit, Type } from 'ts-gems';
import { Validator, validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';
import { ApiElement } from './api-element.js';

export namespace ApiParameter {
  export interface InitArguments extends StrictOmit<OpraSchema.Parameter, 'type'> {
    type?: DataType | string | Type;
    isBuiltin?: boolean;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Parameter, 'type'> {
    type?: TypeThunkAsync | string;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<DecoratorMetadata, 'name' | 'in'>> {
  }

}


/**
 *
 * @class ApiParameter
 */
export class ApiParameter extends ApiElement {
  protected _decoder: Validator;
  protected _encoder: Validator;
  readonly name: string | RegExp;
  readonly type: DataType;
  description?: string;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;
  in: OpraSchema.Parameter.Location;
  required?: boolean;
  isArray?: boolean;
  readonly isBuiltin?: boolean;

  constructor(parent: ApiElement, init: ApiParameter.InitArguments) {
    super(parent);
    const name = String(init.name);
    if (name.startsWith('/'))
      this.name = parseRegExp(name, {includeFlags: 'i', excludeFlags: 'm'})
    else this.name = name;
    this.in = init.in;
    this.required = init.required;
    this.isArray = init.isArray;
    this.isBuiltin = init.isBuiltin;
  }

  exportSchema(): OpraSchema.Parameter {
    return omitUndefined<OpraSchema.Parameter>({
      name: this.name,
      in: this.in,
      type: this.type ? (this.type.name ? this.type.name : this.type.exportSchema()) : undefined,
      description: this.description,
      isArray: this.isArray,
      required: this.required,
      deprecated: this.deprecated,
      examples: this.examples
    })
  }

  getDecoder(): Validator {
    if (!this._decoder) {
      let fn = this.type?.generateCodec('decode', {operation: 'write'}) || vg.isAny();
      if (this.isArray)
        fn = vg.pipe(vg.stringSplit(','), vg.isArray(fn));
      this._decoder = this.required ? vg.required(fn) : vg.optional(fn);
    }
    return this._decoder;
  }

  getEncoder(): Validator {
    if (!this._encoder) {
      let fn = this.type?.generateCodec('encode', {operation: 'read'}) || vg.isAny();
      if (this.isArray)
        fn = vg.pipe(vg.isArray(fn), validator('toString', (x) => x != null ? String(x) : x));
      this._encoder = this.required ? vg.required(fn) : vg.optional(fn);
    }
    return this._encoder;
  }

}

