import omit from 'lodash.omit';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY, TYPENAME_PATTERN } from '../constants.js';
import { ApiField } from './api-field.js';
import { DataType } from './data-type.js';
import type { UnionType } from './union-type';

/**
 * @namespace ComplexType
 */
export namespace ComplexType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.ComplexType, 'ctor' | 'abstract' | 'additionalFields'> {
    base?: ComplexType | UnionType;
  }

  export interface OwnProperties extends DataType.OwnProperties,
      Readonly<Pick<OpraSchema.ComplexType, 'ctor' | 'abstract' | 'additionalFields'>> {
    readonly fields: ResponsiveMap<ApiField>;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'base' | 'additionalFields' | 'abstract'> {

  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType, 'fields'> {
    name: string;
    fields?: Record<string, ApiField.Metadata>;
  }

}

/**
 * Type definition of ComplexType prototype
 * @type ComplexType
 */
export interface ComplexType extends StrictOmit<DataType, 'own' | 'exportSchema'>,
    ComplexType.OwnProperties {
  readonly ctor: Type;
  readonly base?: ComplexType | UnionType;
  readonly own: ComplexType.OwnProperties;
  readonly abstract?: boolean;
  readonly additionalFields?: boolean;

  exportSchema(): OpraSchema.ComplexType;

  addField(init: ApiField.InitArguments): ApiField;

  iteratePath(path: string, silent?: boolean): IterableIterator<[string, ApiField | undefined, string]>;

  getField(nameOrPath: string): ApiField;

  findField(nameOrPath: string): ApiField | undefined;

  normalizeFieldPath(fields: string): string;

  normalizeFieldPath(fields: string[]): string[];

  normalizeFieldPath(fields: string | string[]): string | string[];

}

/**
 * Type definition of ComplexType constructor type
 * @type ComplexTypeConstructor
 */
export interface ComplexTypeConstructor {
  new(document: ApiDocument, init: ComplexType.InitArguments): ComplexType;

  (options?: ComplexType.DecoratorOptions): ClassDecorator;

  prototype: ComplexType;
}

/**
 * @class ComplexType
 */
export const ComplexType = function (
    this: ComplexType | void, ...args: any[]
) {
  // ClassDecorator
  if (!this) {
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
        Object.assign(metadata, omit(options, ['kind', 'name', 'base', 'ctor', 'fields']));
    }
  }

  // Constructor
  // call super()
  DataType.apply(this, args);

  const [, init] = args as [never, ComplexType.InitArguments | undefined];
  const _this = this as Writable<ComplexType>;
  const own = _this.own as Writable<ComplexType.OwnProperties>
  own.ctor = init?.ctor;
  own.fields = new ResponsiveMap();
  own.abstract = init?.abstract;
  own.additionalFields = init?.additionalFields;

  _this.kind = OpraSchema.ComplexType.Kind;
  _this.base = init?.base;
  _this.ctor = own.ctor || Object;
  _this.abstract = own.abstract;
  _this.additionalFields = own.additionalFields;
  _this.fields = new ResponsiveMap();
  if (_this.base) {
    if (_this.additionalFields == null)
      _this.additionalFields = _this.base.additionalFields;
    if (own.ctor == null && _this.base instanceof ComplexType)
      _this.ctor = _this.base.ctor;
    if (_this.base.fields)
      for (const [k, el] of _this.base.fields.entries()) {
        const newEl = new ApiField(_this, el);
        _this.fields.set(k, newEl);
      }
  }
} as ComplexTypeConstructor;

Object.setPrototypeOf(ComplexType.prototype, DataType.prototype);

const proto = {

  extendsFrom(this: ComplexType, t: string | Type | DataType): boolean {
    const base = t instanceof DataType ? t : this.document.getDataType(t);
    if (this.base) {
      if (this.base === base)
        return true;
      return this.base.extendsFrom(base);
    }
    return false;
  },

  exportSchema(this: ComplexType): OpraSchema.ComplexType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.ComplexType;
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
  },

  addField(this: ComplexType, init: ApiField.InitArguments): ApiField {
    const field = new ApiField(this, init);
    this.own.fields.set(field.name, field);
    this.fields.set(field.name, field);
    return field;
  },

  findField(nameOrPath: string): ApiField | undefined {
    let field: ApiField | undefined;
    for (const [, f] of this.iteratePath(nameOrPath, true)) {
      if (!f)
        return;
      field = f;
    }
    return field;
  },

  getField(this: ComplexType, nameOrPath: string): ApiField {
    let field: ApiField | undefined;
    for (const [, f, path] of this.iteratePath(nameOrPath)) {
      if (!f)
        throw new Error(`Invalid field definition "${path}"`);
      field = f;
    }
    /* istanbul ignore next */
    if (!field)
      throw new Error(`Invalid field definition "${nameOrPath}"`);
    return field as ApiField;
  },

  iteratePath(this: ComplexType, path: string, silent?: boolean): IterableIterator<[string, ApiField | undefined, string]> {
    const arr = path.split('.');
    const len = arr.length;
    let dataType: DataType | undefined = this;
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
  },

  normalizeFieldPath(this: ComplexType, path: string | []): string | string[] {
    if (Array.isArray(path))
      return path.map((s: string) => this.normalizeFieldPath(s))
    let curPath = '';
    for (const [, , p] of this.iteratePath(path)) {
      curPath = p;
    }
    return curPath;
  }

} as ComplexType;

Object.assign(ComplexType.prototype, proto);
Object.setPrototypeOf(ComplexType.prototype, DataType.prototype);
