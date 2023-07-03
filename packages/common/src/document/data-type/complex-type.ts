import 'reflect-metadata';
import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type, Writable } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY, TYPENAME_PATTERN } from '../constants.js';
import { ApiField } from './api-field.js';
import { DataType } from './data-type.js';
import type { UnionType } from './union-type.js';

/**
 * @namespace ComplexType
 */
export namespace ComplexType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.ComplexType, 'ctor' | 'abstract' | 'additionalFields'> {
    base?: ComplexType | UnionType;
  }

  export interface OwnProperties extends Readonly<StrictOmit<OpraSchema.ComplexType, 'fields'>> {
    fields: ResponsiveMap<ApiField>;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'additionalFields' | 'abstract'> {
  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType, 'fields'> {
    name: string;
    fields?: Record<string, ApiField.Metadata>;
  }

}

/**
 * @class ComplexType
 */
class ComplexTypeClass extends DataType {
  readonly kind = OpraSchema.ComplexType.Kind;
  readonly ctor: Type;
  readonly base?: ComplexType | UnionType;
  readonly own: ComplexType.OwnProperties;
  readonly fields: ResponsiveMap<ApiField>;
  readonly abstract?: boolean;
  readonly additionalFields?: boolean | vg.Validator<any, any> | 'ignore';
  protected _decoder?: vg.Validator<any, any>;
  protected _encoder?: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: ComplexType.InitArguments) {
    super(document, init);
    const own = this.own = {} as Writable<ComplexType.OwnProperties>;
    own.ctor = init?.ctor;
    own.abstract = init?.abstract;
    own.additionalFields = init?.additionalFields;
    own.fields = new ResponsiveMap();

    this.kind = OpraSchema.ComplexType.Kind;
    this.base = init?.base;
    this.ctor = own.ctor || Object;
    this.abstract = own.abstract;
    this.additionalFields = own.additionalFields;
    this.fields = new ResponsiveMap();
    if (this.base) {
      if (this.additionalFields == null)
        this.additionalFields = this.base.additionalFields;
      if (own.ctor == null && this.base instanceof ComplexType)
        this.ctor = this.base.ctor;
      if (this.base.fields)
        for (const [k, el] of this.base.fields.entries()) {
          const newEl = new ApiField(this, el);
          this.fields.set(k, newEl);
        }
    }
  }

  addField(init: ApiField.InitArguments): ApiField {
    const field = new ApiField(this, init);
    this.own.fields.set(field.name, field);
    this.fields.set(field.name, field);
    return field;
  }

  findField(nameOrPath: string): ApiField | undefined {
    let field: ApiField | undefined;
    if (nameOrPath.includes('.')) {
      for (const [, f] of this.iteratePath(nameOrPath, true)) {
        if (!f)
          return;
        field = f;
      }
      return field;
    }
    return this.fields.get(nameOrPath);
  }

  getField(nameOrPath: string): ApiField {
    let field: ApiField | undefined;
    if (nameOrPath.includes('.')) {
      for (const [, f] of this.iteratePath(nameOrPath)) {
        field = f;
      }
    } else field = this.fields.get(nameOrPath);
    if (!field)
      throw new Error(`Unknown field "${nameOrPath}"`);
    return field as ApiField;
  }

  iteratePath(path: string, silent?: boolean): IterableIterator<[string, ApiField | undefined, string]> {
    const arr = path.split('.');
    const len = arr.length;
    let dataType: DataType | undefined = this as DataType;
    let field: ApiField | undefined;
    let curPath = '';
    let s: string;
    let i = -1;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        if (i < len) {
          s = arr[i];
          if (dataType && !(dataType instanceof ComplexType)) {
            if (silent)
              return {done: true, value: [] as any};
            throw new TypeError(`"${curPath}" field is not a complex type and has no child fields`);
          }
          field = dataType?.fields.get(s);
          if (field) {
            curPath += (curPath ? '.' : '') + field.name;
            dataType = field.type;
          } else {
            curPath += (curPath ? '.' : '') + s;
            if (dataType && !dataType.additionalFields) {
              if (silent)
                return {done: true, value: [] as any};
              throw new Error(`Unknown or Invalid field (${curPath})`);
            }
          }
        }
        return {
          done: i >= len,
          value: [field?.name || s, field, curPath]
        }
      }
    };
  }

  normalizeFieldPath(fieldPath: string): string;
  normalizeFieldPath(fieldPaths: string[]): string[];
  normalizeFieldPath(fieldPaths: string | string[]): string | string[] {
    if (Array.isArray(fieldPaths))
      return fieldPaths.map((s: string) => this.normalizeFieldPath(s))
    let curPath = '';
    for (const [, , p] of this.iteratePath(fieldPaths)) {
      curPath = p;
    }
    return curPath;
  }

  exportSchema(): OpraSchema.ComplexType {
    const out = super.exportSchema() as OpraSchema.ComplexType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      abstract: this.own.abstract,
      additionalFields: this.own.additionalFields
    }));
    if (this.own.fields.size) {
      const fields = out.fields = {};
      for (const field of this.own.fields.values()) {
        fields[field.name] = field.exportSchema();
      }
    }
    return omitUndefined(out);
  }

  isTypeOf(t: Type | Function): boolean {
    return t === this.own.ctor;
  }

  extendsFrom(t: string | Type | DataType): boolean {
    const base = t instanceof DataType ? t : this.document.getDataType(t);
    if (this.base) {
      if (this.base === base)
        return true;
      return this.base.extendsFrom(base);
    }
    return false;
  }

  decode(v: object): any {
    return this._getDecoder()(v, {coerce: true});
  }

  encode(v: any): any {
    return this._getEncoder()(v, {coerce: true});
  }

  validate(v: any): any {
    return this._getEncoder()(v);
  }

  protected _getDecoder(): vg.Validator<any, any> {
    if (this._decoder)
      return this._decoder;
    const schema: vg.ObjectSchema = {};
    for (const f of this.fields.values()) {
      let t = (f.type as any)._getDecoder();
      if (f.isArray)
        t = vg.isArray(t);
      schema[f.name] = f.required ? vg.required(t) : vg.optional(t);
    }
    this._decoder = vg.isObject(schema, {
      ctor: this.ctor,
      additionalFields: this.additionalFields ?? 'ignore',
      name: this.name,
      caseInSensitive: true,
    });
    return this._decoder;
  }

  protected _getEncoder(): vg.Validator<any, any> {
    if (this._encoder)
      return this._encoder;
    const schema: vg.ObjectSchema = {};
    for (const f of this.fields.values()) {
      let t = (f.type as any)._getEncoder();
      if (f.isArray)
        t = vg.isArray(t);
      schema[f.name] = t;
    }
    this._encoder = vg.isObject(schema, {
      ctor: this.ctor,
      additionalFields: this.additionalFields,
      name: this.name,
      caseInSensitive: true,
      detectCircular: true
    });
    return this._encoder;
  }

}


/**
 * Callable class pattern for ComplexType
 */
export interface ComplexTypeConstructor {
  new(document: ApiDocument, init: ComplexType.InitArguments): ComplexType;

  (options?: ComplexType.DecoratorOptions): ClassDecorator;

  prototype: ComplexType;
}

export interface ComplexType extends ComplexTypeClass {
}

/**
 * @class ComplexType
 */
export const ComplexType = function (
    this: ComplexType | void, ...args: any[]
) {
  // Constructor
  if (this) {
    const [document, init] = args as [ApiDocument, ComplexType.InitArguments];
    merge(this, new ComplexTypeClass(document, init), {descriptor: true});
    return;
  }

  // ClassDecorator

  const [options] = args as [ComplexType.DecoratorOptions | undefined];
  return function (target: Function) {
    const name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
    let metadata = Reflect.getOwnMetadata(METADATA_KEY, target) as ComplexType.Metadata;
    if (!metadata) {
      metadata = {} as ComplexType.Metadata;
      Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.name = name;
    // Merge options
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name', 'base', 'fields']));
  }

} as ComplexTypeConstructor;

ComplexType.prototype = ComplexTypeClass.prototype;
