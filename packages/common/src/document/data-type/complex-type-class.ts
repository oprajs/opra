import { Type, Writable } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { ApiField } from './field.js';
import type { MappedType } from './mapped-type.js';
import type { UnionType } from './union-type.js';

/**
 * @class ComplexType
 */
export class ComplexTypeClass extends DataType {
  protected _decode: vg.Validator<any, any>;
  protected _encode: vg.Validator<any, any>;
  readonly kind = OpraSchema.ComplexType.Kind;
  readonly ctor: Type;
  readonly base?: ComplexType | UnionType | MappedType;
  readonly own: ComplexType.OwnProperties;
  readonly fields: ResponsiveMap<ApiField>;
  readonly abstract?: boolean;
  readonly additionalFields?: boolean | vg.Validator | 'error';

  constructor(document: ApiDocument, init: ComplexType.InitArguments) {
    super(document, init);
    const own = this.own = {} as Writable<ComplexType.OwnProperties>;
    own.ctor = init?.ctor || init?.base?.ctor;
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
      throw new Error(translate('error:UNKNOWN_FIELD', {field: nameOrPath}));
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
    const ComplexType: Type<ComplexType> = Object.getPrototypeOf(this).constructor;
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
              throw new Error(translate('error:UNKNOWN_FIELD', {field: curPath}));
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

  normalizeFieldPath(fieldPaths: string | string[]): string[] | undefined {
    const array = (Array.isArray(fieldPaths) ? fieldPaths : [fieldPaths])
        .map(s => {
          let curPath = '';
          for (const [, , p] of this.iteratePath(s)) {
            curPath = p;
          }
          return curPath;
        }).flat()
    return array.length ? array : undefined;
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

}