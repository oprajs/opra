import { asMutable, type StrictOmit, type Type } from 'ts-gems';
import { type IsObject, type Validator, validator, vg } from 'valgen';
import {
  FieldsProjection,
  parseFieldsProjection,
  ResponsiveMap,
} from '../../helpers/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { DocumentElement } from '../common/document-element.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import type { ApiField } from './api-field.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';

export const FIELD_PATH_PATTERN = /^([+-])?([a-z$_][\w.]*)$/i;

/**
 * Type definition of class constructor for ComplexTypeBase
 * @class ComplexTypeBase
 */
interface ComplexTypeBaseStatic {
  /**
   * Class constructor of MappedType
   *
   * @param owner
   * @param initArgs
   * @param context
   * @constructor
   */
  new (
    owner: DocumentElement,
    initArgs: DataType.InitArguments,
    context?: DocumentInitContext,
  ): ComplexTypeBase;

  prototype: ComplexTypeBase;
}

/**
 * Type definition of ComplexTypeBase prototype
 * @interface ComplexTypeBase
 */
export interface ComplexTypeBase extends ComplexTypeBaseClass {}

/**
 *
 * @constructor
 */
export const ComplexTypeBase = function (
  this: ComplexTypeBase | void,
  ...args: any[]
) {
  if (!this)
    throw new TypeError('"this" should be passed to call class constructor');
  // Constructor
  const [owner, initArgs, context] = args as [
    DocumentElement,
    ComplexType.InitArguments,
    DocumentInitContext | undefined,
  ];
  DataType.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.fields = new ResponsiveMap();
} as Function as ComplexTypeBaseStatic;

/**
 *
 */
abstract class ComplexTypeBaseClass extends DataType {
  readonly ctor?: Type;
  declare readonly fields: ResponsiveMap<ApiField>;
  readonly additionalFields?:
    | boolean
    | DataType
    | ['error']
    | ['error', string];
  readonly keyField?: OpraSchema.Field.Name;

  /**
   *
   */
  findField(nameOrPath: string): ApiField | undefined {
    if (nameOrPath.includes('.')) {
      const fieldPath = this.parseFieldPath(nameOrPath);
      const lastItem = fieldPath.pop();
      return lastItem?.field;
    }
    return this.fields.get(nameOrPath);
  }

  /**
   *
   */
  getField(nameOrPath: string): ApiField {
    const field = this.findField(nameOrPath);
    if (!field)
      throw new Error(translate('error:UNKNOWN_FIELD', { field: nameOrPath }));
    return field as ApiField;
  }

  /**
   *
   */
  parseFieldPath(
    fieldPath: string,
    options?: {
      allowSigns?: 'first' | 'each';
    },
  ): ComplexType.ParsedFieldPath[] {
    let dataType: DataType | undefined = this;
    let field: ApiField | undefined;
    const arr = fieldPath.split('.');
    const len = arr.length;
    const out: ComplexType.ParsedFieldPath[] = [];
    const objectType = this.owner.node.getDataType('object');
    const allowSigns = options?.allowSigns;
    const getStrPath = () => out.map(x => x.fieldName).join('.');

    for (let i = 0; i < len; i++) {
      const item: ComplexType.ParsedFieldPath = {
        fieldName: arr[i],
        dataType: objectType,
      };
      out.push(item);

      const m = FIELD_PATH_PATTERN.exec(arr[i]);
      if (!m) throw new TypeError(`Invalid field name (${getStrPath()})`);
      if (m[1]) {
        if ((i === 0 && allowSigns === 'first') || allowSigns === 'each')
          item.sign = m[1] as any;
        item.fieldName = m[2];
      }

      if (dataType) {
        if (dataType instanceof ComplexTypeBase) {
          field = dataType.fields.get(item.fieldName);
          if (field) {
            item.fieldName = field.name;
            item.field = field;
            item.dataType = field.type;
            dataType = field.type;
            continue;
          }
          if (dataType.additionalFields?.[0] === true) {
            item.additionalField = true;
            item.dataType = objectType;
            dataType = undefined;
            continue;
          }
          if (
            dataType.additionalFields?.[0] === 'type' &&
            dataType.additionalFields?.[1] instanceof DataType
          ) {
            item.additionalField = true;
            item.dataType = dataType.additionalFields[1];
            dataType = dataType.additionalFields[1];
            continue;
          }
          throw new Error(
            `Unknown field (${out.map(x => x.fieldName).join('.')})`,
          );
        }
        throw new TypeError(
          `"${out.map(x => x.fieldName).join('.')}" field is not a complex type and has no child fields`,
        );
      }
      item.additionalField = true;
      item.dataType = objectType;
    }
    return out;
  }

  /**
   *
   */
  normalizeFieldPath(
    fieldPath: string,
    options?: {
      allowSigns?: 'first' | 'each';
    },
  ): string {
    return this.parseFieldPath(fieldPath, options)
      .map(x => (x.sign || '') + x.fieldName)
      .join('.');
  }

  /**
   *
   */
  generateCodec(
    codec: 'encode' | 'decode',
    options?: DataType.GenerateCodecOptions,
  ): Validator {
    const projection = Array.isArray(options?.projection)
      ? parseFieldsProjection(options.projection)
      : options?.projection;
    const schema = this._generateSchema(codec, {
      ...options,
      projection,
      currentPath: '',
    });

    let additionalFields: any;
    if (this.additionalFields instanceof DataType) {
      additionalFields = this.additionalFields.generateCodec(codec, options);
    } else if (typeof this.additionalFields === 'boolean')
      additionalFields = this.additionalFields;
    else if (Array.isArray(this.additionalFields)) {
      if (this.additionalFields.length < 2) additionalFields = 'error';
      else {
        const message = additionalFields[1] as string;
        additionalFields = validator((input, context, _this) =>
          context.fail(_this, message, input),
        );
      }
    }

    return vg.isObject(schema, {
      ctor: this.name === 'object' ? Object : this.ctor,
      additionalFields,
      name: this.name,
      coerce: true,
      caseInSensitive: options?.caseInSensitive,
      onFail: options?.onFail,
    });
  }

  protected _generateSchema(
    codec: 'encode' | 'decode',
    context: StrictOmit<DataType.GenerateCodecOptions, 'projection'> & {
      currentPath: string;
      projection?: FieldsProjection | '*';
    },
  ) {
    const schema: IsObject.Schema = {};
    const { currentPath, projection } = context;
    const pickList = !!(
      projection && Object.values(projection).find(p => !p.sign)
    );
    const scope = context.scope
      ? Array.isArray(context.scope)
        ? context.scope
        : [context.scope]
      : undefined;
    // Process fields
    let fieldName: string;
    for (const field of this.fields.values()) {
      if (
        /** Ignore field if required scope(s) do not match field scopes */
        (scope && !field.inScope(scope)) ||
        /** Ignore field if readonly and ignoreReadonlyFields option true */
        (context.ignoreReadonlyFields && field.readonly) ||
        /** Ignore field if writeonly and ignoreWriteonlyFields option true */
        (context.ignoreWriteonlyFields && field.writeonly)
      ) {
        schema[field.name] = vg.isUndefined({ coerce: true });
        continue;
      }
      fieldName = field.name;
      let p: any;
      if (projection !== '*') {
        p = projection?.[fieldName.toLowerCase()];
        if (
          /** Ignore if field is omitted */
          p?.sign === '-' ||
          /** Ignore if default fields ignored and field is not in projection */
          (pickList && !p) ||
          /** Ignore if default fields enabled and fields is exclusive */
          (!pickList && field.exclusive && !p)
        ) {
          schema[field.name] = vg.isUndefined({ coerce: true });
          continue;
        }
      }
      const fn = this._generateFieldCodec(codec, field, {
        ...context,
        partial: context.partial === 'deep' ? context.partial : undefined,
        projection:
          typeof projection === 'object'
            ? projection[fieldName]?.projection || '*'
            : projection,
        currentPath: currentPath + (currentPath ? '.' : '') + fieldName,
      });
      schema[fieldName] =
        context.partial || !field.required ? vg.optional(fn) : vg.required(fn);
    }
    if (context.allowPatchOperators) {
      schema._$pull = vg.optional(vg.isAny());
      schema._$push = vg.optional(vg.isAny());
    }
    return schema;
  }

  protected _generateFieldCodec(
    codec: 'encode' | 'decode',
    field: ApiField,
    context: StrictOmit<DataType.GenerateCodecOptions, 'projection'> & {
      currentPath: string;
      projection?: FieldsProjection | '*';
    },
  ): Validator {
    let fn = field.type.generateCodec(codec, context);
    if (field.fixed) fn = vg.isEnum([field.fixed]);
    if (field.isArray) fn = vg.isArray(fn);
    return fn;
  }
}

ComplexTypeBase.prototype = ComplexTypeBaseClass.prototype;
