import omit from 'lodash.omit';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { ObjectTree, omitUndefined, pathToObjectTree, ResponsiveMap } from '../../helpers/index.js';
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
    readonly fields: ResponsiveMap<string, ApiField>;
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

  exportSchema(): OpraSchema.ComplexType;

  addField(init: ApiField.InitArguments): ApiField;

  getField(name: string): ApiField;

  normalizeFieldNames(fields: string | string[]): string[] | undefined;
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

  extendsFrom(t: string | Type | DataType): boolean {
    const base = t instanceof DataType ? t : this.document.getDataType(t);
    if (this.base) {
      if (this.base === base)
        return true;
      return this.base.extendsFrom(base);
    }
    return false;
  },

  exportSchema(): OpraSchema.ComplexType {
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

  addField(init: ApiField.InitArguments): ApiField {
    const field = new ApiField(this, init);
    this.own.fields.set(field.name, field);
    this.fields.set(field.name, field);
    return field;
  },

  getField(name: string): ApiField {
    if (name.includes('.')) {
      let dt: DataType = this;
      const arr = name.split('.');
      const l = arr.length;
      let field: ApiField;
      for (let i = 0; i < l; i++) {
        if (!(dt instanceof ComplexType))
          throw new TypeError(`"${arr.slice(0, i - 1)}" field is not a ${OpraSchema.ComplexType.Kind} and has no child fields`);
        field = dt.getField(arr[i]);
        dt = field.type;
      }
      // @ts-ignore
      return field;
    }
    const t = this.fields.get(name);
    if (!t)
      throw new Error(`"${this.name}" type doesn't have an field named "${name}"`);
    return t;
  },

  normalizeFieldNames(this: ComplexType, fields: string | string[]): string[] | undefined {
    const fieldsTree = (fields && pathToObjectTree(Array.isArray(fields) ? fields: [fields])) || {};
    const out = _normalizeFieldsNames([], this.document, this, fieldsTree, '', '');
    return out.length ? out : undefined;
  }

} as ComplexType;

Object.assign(ComplexType.prototype, proto);
Object.setPrototypeOf(ComplexType.prototype, DataType.prototype);

/**
 * Normalizes field names
 */
function _normalizeFieldsNames(
    target: string[],
    document: ApiDocument,
    dataType: ComplexType | undefined,
    node: ObjectTree,
    parentPath: string = '',
    actualPath: string = ''
): string[] {
  let curPath = '';
  for (const k of Object.keys(node)) {
    const nodeVal = node[k];

    const field = dataType?.fields.get(k);
    if (!field) {
      curPath = parentPath ? parentPath + '.' + k : k;

      if ((dataType && !dataType.additionalFields))
        throw new TypeError(`Unknown field "${curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeFieldsNames(target, document, undefined, nodeVal, curPath, actualPath);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + field.name : field.name;

    if (typeof nodeVal === 'object') {
      if (!(field.type instanceof ComplexType))
        throw new TypeError(`"${(actualPath ? actualPath + '.' + curPath : curPath)}" is not a complex type and has no sub fields`);
      if (target.findIndex(x => x === parentPath) >= 0)
        continue;

      target = _normalizeFieldsNames(target, document, field.type, nodeVal, curPath, actualPath);
      continue;
    }

    if (target.findIndex(x => x.startsWith(curPath + '.')) >= 0) {
      target = target.filter(x => !x.startsWith(curPath + '.'));
    }

    target.push(curPath);
  }
  return target;
}
