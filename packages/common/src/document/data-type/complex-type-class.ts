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
  readonly kind: OpraSchema.DataType.Kind = OpraSchema.ComplexType.Kind;
  readonly ctor: Type;
  readonly base?: ComplexType | UnionType | MappedType;
  readonly own: ComplexType.OwnProperties;
  readonly fields = new ResponsiveMap<ApiField>();
  readonly abstract?: boolean;
  readonly additionalFields?: boolean | DataType | 'error';

  constructor(document: ApiDocument, init: ComplexType.InitArguments) {
    super(document, init);
    const own = this.own = {} as Writable<ComplexType.OwnProperties>;
    own.ctor = init.ctor;
    if (init.base) {
      if (!(init.base.kind === 'ComplexType' || init.base.kind === 'MappedType' || init.base.kind === 'UnionType'))
        throw new TypeError('"base" argument must be one of ComplexType or MappedType or UnionType');
      own.ctor = own.ctor || (init.base as ComplexTypeClass).ctor;
    }
    own.additionalFields = init?.additionalFields;
    own.fields = new ResponsiveMap();

    this.kind = OpraSchema.ComplexType.Kind;
    this.base = init?.base;
    this.ctor = own.ctor || Object;
    this.abstract = init.abstract;
    this.additionalFields = own.additionalFields;
    if (this.base?.additionalFields === true && this.additionalFields !== true)
      this.additionalFields = true;
    else if (this.base?.additionalFields === 'error' && !this.additionalFields)
      this.additionalFields = 'error';
    if (this.base) {
      if (this.base.fields)
        for (const [k, el] of this.base.fields.entries()) {
          const field = new ApiField(this, el);
          this.fields.set(k, field);
        }
    }
    if (init.fields) {
      for (const [k, el] of Object.entries(init.fields)) {
        const field = new ApiField(this, el);
        this.own.fields.set(field.name, field);
        this.fields.set(k, field);
      }
    }
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

  exportSchema(options?: { webSafe?: boolean }): any {
    const out = super.exportSchema(options) as OpraSchema.ComplexType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema(options)) : undefined,
      abstract: this.abstract,
      additionalFields: this.own.additionalFields instanceof DataType
          ? (this.own.additionalFields.name
                  ? this.own.additionalFields.name
                  : this.own.additionalFields.exportSchema(options)
          )
          : this.own.additionalFields
    }));
    if (this.own.fields.size) {
      const fields = out.fields = {};
      for (const field of this.own.fields.values()) {
        fields[field.name] = field.exportSchema(options);
      }
    }
    return omitUndefined(out);
  }

  isTypeOf(t: Type | Function): boolean {
    return t === this.own?.ctor;
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

  generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): vg.Validator {
    const schema = this._generateCodecSchema(codec, options);
    const additionalFields = this.additionalFields instanceof DataType
        ? this.additionalFields.generateCodec(codec, options)
        : this.additionalFields
    return vg.isObject(schema, {
      ctor: this.ctor,
      additionalFields,
      name: this.name,
      caseInSensitive: !options?.caseSensitive
    })
  }

  protected _generateCodecSchema(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): vg.ObjectSchema {
    const schema: vg.ObjectSchema = {};
    const pickOption = (options?.pick || []).map(x => x.toLowerCase());
    const omitOption = (options?.omit || []).map(x => x.toLowerCase());
    const dedupedFieldNames: string[] =
        (options?.overwriteFields
                ? Array.from(new Set([...this.fields.keys(), ...options?.overwriteFields.keys()]))
                : Array.from(this.fields.keys())
        ).map(x => x.toLocaleString());
    for (const nameLower of dedupedFieldNames) {
      const overwriteField = options?.overwriteFields?.get(nameLower);
      const field = this.fields.get(nameLower);
      /* istanbul ignore next */
      if (!(field || overwriteField)) continue;
      if (!overwriteField &&
          (
              omitOption.find(x => x === nameLower) ||
              (pickOption.length && !pickOption.find(x => x === nameLower || x.startsWith(nameLower + '.')))
          )
      ) continue;

      let f: ApiField;
      if (overwriteField) {
        f = {...overwriteField} as ApiField;
        if (!field)
          (f as any).type = this.document.getDataType('any');
        Object.setPrototypeOf(f, field || ApiField.prototype);
      } else f = field as ApiField;

      schema[f.name] = f.generateCodec(codec, {
        ...options,
        pick: overwriteField ? [] :
            pickOption
                .filter(x => x.startsWith(nameLower + '.'))
                .map(x => x.substring(x.indexOf('.') + 1)),
        omit: overwriteField ? [] :
            omitOption
                .filter(x => x.startsWith(nameLower + '.'))
                .map(x => x.substring(x.indexOf('.') + 1)),
      });
    }
    return schema;
  }

}
