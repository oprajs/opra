import { StrictOmit, TypeThunkAsync } from 'ts-gems';
import { Validator, validator, vg } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { ApiNode } from '../api-node.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';

export namespace HttpParameter {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.Parameter, 'type'> {
    type?: string | DataType;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Http.Parameter, 'type'> {
    type?: TypeThunkAsync | string;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<DecoratorMetadata, 'name' | 'in'>> {
  }

}


/**
 *
 * @class HttpParameter
 */
export class HttpParameter extends ApiNode {
  protected _decoder: Validator;
  protected _encoder: Validator;
  readonly name: string | RegExp;
  type?: DataType;
  description?: string;
  deprecated?: boolean | string;
  examples?: any[] | Record<string, any>;
  in: OpraSchema.Http.Parameter.Location;
  required?: boolean;
  isArray?: boolean;
  readonly isBuiltin?: boolean;

  constructor(parent: ApiNode, init: HttpParameter.InitArguments) {
    super(parent);
    const name = String(init.name);
    if (name.startsWith('/'))
      this.name = parseRegExp(name, {includeFlags: 'i', excludeFlags: 'm'})
    else this.name = name;
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
    this.in = init.in;
    this.required = init.required;
    this.isArray = init.isArray;
    this.deprecated = init.deprecated;
    this.examples = init.examples;
  }

  toJSON(): OpraSchema.Http.Parameter {
    return omitUndefined<OpraSchema.Http.Parameter>({
      name: this.name,
      in: this.in,
      type: this.type?.name,
      description: this.description,
      isArray: this.isArray,
      required: this.required,
      deprecated: this.deprecated,
      examples: this.examples
    })
  }

  getDecoder(): Validator {
    if (!this._decoder) {
      let fn = this.type?.generateCodec('decode', {
        operation: 'write',
        caseInSensitive: true
      }) || vg.isAny();
      if (this.isArray)
        fn = vg.pipe(vg.stringSplit(','), vg.isArray(fn));
      this._decoder = this.required ? vg.required(fn) : vg.optional(fn);
    }
    return this._decoder;
  }

  getEncoder(): Validator {
    if (!this._encoder) {
      let fn = this.type?.generateCodec('encode', {
        operation: 'read',
        caseInSensitive: true
      }) || vg.isAny();
      if (this.isArray)
        fn = vg.pipe(vg.isArray(fn), validator('toString', (x) => x != null ? String(x) : x));
      this._encoder = this.required ? vg.required(fn) : vg.optional(fn);
    }
    return this._encoder;
  }

}

