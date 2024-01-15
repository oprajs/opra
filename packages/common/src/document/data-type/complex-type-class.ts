import { Mutable, RequiredSome, Type } from 'ts-gems';
import { IsObject, vg } from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { SORT_FIELD_PATTERN } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { ApiField } from './field.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * @class ComplexType
 */
export class ComplexTypeClass extends DataType {
  readonly kind: OpraSchema.DataType.Kind = OpraSchema.ComplexType.Kind;
  readonly ctor: Type;
  readonly base?: ComplexType | MixinType | MappedType;
  readonly own: ComplexType.OwnProperties;
  readonly fields = new ResponsiveMap<ApiField>();
  readonly abstract?: boolean;
  readonly additionalFields?: boolean | DataType | 'error';

  constructor(document: ApiDocument, init: ComplexType.InitArguments) {
    super(document, init);
    const own = this.own = {} as Mutable<ComplexType.OwnProperties>;
    own.ctor = init.ctor;
    if (init.base) {
      if (!(init.base.kind === 'ComplexType' || init.base.kind === 'MappedType' || init.base.kind === 'MixinType'))
        throw new TypeError('"base" argument must be one of ComplexType or MappedType or MixinType');
      own.ctor = own.ctor || (init.base as ComplexTypeClass).ctor;
    }
    own.additionalFields = init?.additionalFields;
    own.embedded = init?.embedded;
    own.fields = new ResponsiveMap();

    this.kind = OpraSchema.ComplexType.Kind;
    this.base = init?.base;
    this.ctor = own.ctor || Object;
    this.abstract = init.abstract;
    this.additionalFields = own.additionalFields;
    this.isEmbedded = this.isEmbedded || init.embedded;
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

  normalizeFieldNames(fieldNames: string | string[], allowSortSigns?: boolean): string[] | undefined {
    const array = (Array.isArray(fieldNames) ? fieldNames : [fieldNames])
        .map(s => {
          let sign = '';
          if (allowSortSigns) {
            const m = SORT_FIELD_PATTERN.exec(s);
            sign = (m && m[1]) || '';
            s = (m && m[2]) || s;
          }
          let curPath = '';
          for (const [, , p] of this.iteratePath(s)) {
            curPath = p;
          }
          return sign + curPath;
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

  generateCodec<T extends Object = any>(
      codec: 'decode' | 'encode',
      options?: DataType.GenerateCodecOptions
  ): IsObject.Validator<T> {
    const schema = this.generateCodecSchema(codec, options);
    const additionalFields = this.additionalFields instanceof DataType
        ? this.additionalFields.generateCodec(codec, {
          operation: options?.operation,
          caseSensitive: options?.caseSensitive,
          partial: options?.partial
        })
        : this.additionalFields
    return vg.isObject(schema, {
      ctor: this.ctor,
      additionalFields,
      name: this.name,
      caseInSensitive: !options?.caseSensitive,
      onFail: options?.onFail
    });
  }

  generateCodecSchema(
      codec: 'decode' | 'encode',
      options?: DataType.GenerateCodecOptions
  ): IsObject.Schema {
    const opts = {
      ...options,
      pick: (options?.pick || []).map(x => x.toLowerCase()),
      omit: (options?.omit || []).map(x => x.toLowerCase()),
      overwriteFields: options?.overwriteFields ? this._buildOverwriteFieldsTree(options.overwriteFields) : undefined,
    }
    return this._generateCodecSchema(codec, opts);
  }

  protected _generateCodecSchema(
      codec: 'decode' | 'encode',
      options?: RequiredSome<DataType.GenerateCodecOptions, 'pick' | 'omit'>
  ): IsObject.Schema {
    const schema: IsObject.Schema = {};
    const overwriteFields = options?.overwriteFields;
    const optionsPick = options?.pick || [];
    const optionsOmit = options?.omit || [];
    const fieldNames = [...this.fields.keys()];
    // Add field name from overwriteFields which doesn't exist in this.fields
    if (overwriteFields) {
      for (const k of Object.keys(overwriteFields)) {
        if (!this.fields.has(k))
          fieldNames.push(k);
      }
    }

    // Process fields
    for (const fieldName of fieldNames) {
      const lowerName = fieldName.toLowerCase();
      const overwriteFieldInit = overwriteFields?.[fieldName];

      // If field omitted or not in pick list we ignore it unless overwriteField defined
      if (!overwriteFieldInit &&
          (
              optionsOmit.find(x => x === lowerName) ||
              (optionsPick.length && !optionsPick.find(x => x === lowerName || x.startsWith(lowerName + '.')))
          )
      ) continue;

      const subOptions = {
        ...options,
        pick: optionsPick
            .filter(x => x.startsWith(lowerName + '.'))
            .map(x => x.substring(x.indexOf('.') + 1)),
        omit: optionsOmit
            .filter(x => x.startsWith(lowerName + '.'))
            .map(x => x.substring(x.indexOf('.') + 1)),
        overwriteFields: overwriteFieldInit?.overrideFields
      }

      let f: ApiField;
      if (overwriteFieldInit) {
        const field = this.fields.get(fieldName);
        const init: any = {...field, ...overwriteFieldInit, name: fieldName};
        if (!(init.type instanceof DataType))
          init.type = this.document.getDataType(init.type || 'any');
        f = new ApiField(this, init);
      } else f = this.getField(fieldName) as ApiField;

      schema[f.name] = f.generateCodec(codec, subOptions);
    }

    return schema;
  }

  protected _buildOverwriteFieldsTree(obj: Record<string, DataType.OverrideFieldsConfig>) {
    const tree: Record<string, DataType.OverrideFieldsConfig> = {};
    for (let k of Object.keys(obj)) {
      const v = obj[k];
      if (!k.includes('.')) {
        // Fix field name
        const field = this.fields.get(k);
        if (field) k = field.name;

        tree[k] = {...tree[k], ...v};
        continue;
      }
      const keyPath = k.split('.');
      let subTree = tree;
      while (keyPath.length) {
        let j = keyPath.shift() as string;
        // Fix field name
        const field = this.fields.get(j);
        if (field) j = field.name;

        const treeItem = subTree[j] = subTree[j] || {};
        if (keyPath.length) {
          subTree = treeItem.overrideFields = treeItem.overrideFields || {};
        } else
          Object.assign(treeItem, v);
      }
    }
    return tree;
  }

}

