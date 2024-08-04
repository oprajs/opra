import 'reflect-metadata';
import { asMutable, Combine, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import type { DocumentInitContext } from '../common/document-init-context';
import { ApiField } from './api-field.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeBase } from './complex-type-base.js';
import { DataType } from './data-type.js';
import type { MixinType } from './mixin-type';
import { getIsInheritedPredicateFn } from './utils/get-is-inherited-predicate-fn.js';

/**
 * @namespace MappedType
 */
export namespace MappedType {
  export interface Metadata
    extends Combine<
      {
        kind: OpraSchema.MappedType.Kind;
        base: Type | string;
      },
      DataType.Metadata,
      Pick<ComplexType.Metadata, 'additionalFields'>,
      OpraSchema.MappedType
    > {}

  export interface Options<T, K = keyof T> {
    pick?: readonly K[];
    omit?: readonly K[];
    partial?: readonly K[] | boolean;
  }

  export interface InitArguments
    extends Combine<
      {
        kind: OpraSchema.MappedType.Kind;
        base: ComplexType | MappedType | MixinType;
        ctor?: Type;
      },
      DataType.InitArguments,
      MappedType.Metadata
    > {}
}

/**
 * Type definition of class constructor for MappedType
 */
export interface MappedTypeStatic {
  /**
   * Class constructor of MappedType
   *
   * @param owner
   * @param args
   * @constructor
   */
  new (owner: DocumentElement, args: MappedType.InitArguments): MappedType;

  /* Used by extensions */
  _applyMixin(
    targetType: Type,
    sourceType: Type,
    options: MappedType.Options<any> & {
      isInheritedPredicate: (fieldName: string) => boolean;
    },
  ): void;

  prototype: MappedType;
}

/**
 * Type definition of MappedType prototype
 * @interface MappedType
 */
export interface MappedType extends MappedTypeClass {}

/**
 * MappedType constructor
 */
export const MappedType = function (this: MappedType, ...args: any[]) {
  if (!this) throw new TypeError('"this" should be passed to call class constructor');
  // Constructor
  const [owner, initArgs, context] = args as [
    DocumentElement,
    MappedType.InitArguments,
    DocumentInitContext | undefined,
  ];
  ComplexTypeBase.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.kind = OpraSchema.MappedType.Kind;
  if (initArgs.base) {
    // noinspection SuspiciousTypeOfGuard
    if (!(initArgs.base instanceof ComplexTypeBase)) {
      throw new TypeError(`"${(initArgs.base as DataType).kind}" can't be set as base for a "${this.kind}"`);
    }
    _this.base = initArgs.base;
    _this.ctor = initArgs.ctor || _this.base.ctor;

    if (initArgs.pick) _this.pick = initArgs.pick.map(f => _this.base.normalizeFieldPath(f));
    else if (initArgs.omit) _this.omit = initArgs.omit.map(f => _this.base.normalizeFieldPath(f));
    else if (initArgs.partial) {
      _this.partial = Array.isArray(initArgs.partial)
        ? initArgs.partial.map(f => _this.base.normalizeFieldPath(f))
        : initArgs.partial;
    } else if (initArgs.required) {
      _this.required = Array.isArray(initArgs.required)
        ? initArgs.required.map(f => _this.base.normalizeFieldPath(f))
        : initArgs.required;
    }

    /** Copy fields from base */
    const isInheritedPredicate = getIsInheritedPredicateFn(_this.pick, _this.omit);
    const partial = Array.isArray(_this.partial) ? _this.partial.map(x => x.toLowerCase()) : _this.partial;
    const required = Array.isArray(_this.required) ? _this.required.map(x => x.toLowerCase()) : _this.required;
    for (const [k, v] of _this.base.fields.entries()) {
      if (!isInheritedPredicate(k)) continue;
      const meta = { ...v } as ApiField.InitArguments;
      if (partial === true || (Array.isArray(partial) && partial.includes(v.name.toLowerCase()))) {
        meta.required = false;
      } else if (required === true || (Array.isArray(required) && required.includes(v.name.toLowerCase()))) {
        meta.required = true;
      }
      const field = new ApiField(this, meta);
      _this.fields.set(field.name, field);
    }

    if (
      !_this.pick ||
      _this.base.additionalFields === false ||
      (Array.isArray(_this.base.additionalFields) && _this.base.additionalFields?.[0] === 'error')
    ) {
      _this.additionalFields = _this.base.additionalFields;
    }
    if (initArgs.base.keyField && isInheritedPredicate(initArgs.base.keyField)) _this.keyField = initArgs.base.keyField;
  }
} as Function as MappedTypeStatic;

/**
 *
 * @class MappedType
 */
class MappedTypeClass extends ComplexTypeBase {
  declare readonly kind: OpraSchema.MappedType.Kind;
  declare readonly base: ComplexType | MappedType | MixinType;
  declare readonly ctor?: Type;
  readonly omit?: Field.Name[];
  readonly pick?: Field.Name[];
  readonly partial?: Field.Name[] | boolean;
  readonly required?: Field.Name[] | boolean;

  extendsFrom(baseType: DataType | string | Type | object): boolean {
    if (!(baseType instanceof DataType)) baseType = this.node.getDataType(baseType);
    if (!(baseType instanceof ComplexTypeBase)) return false;
    if (baseType === this) return true;
    return !!this.base?.extendsFrom(baseType);
  }

  toJSON(): OpraSchema.MappedType {
    const baseName = this.base ? this.node.getDataTypeNameWithNs(this.base) : undefined;
    return omitUndefined<OpraSchema.MappedType>({
      ...ComplexTypeBase.prototype.toJSON.call(this),
      base: baseName ? baseName : this.base.toJSON(),
      kind: this.kind as any,
      pick: this.pick,
      omit: this.omit,
      partial: this.partial,
      required: this.required,
    });
  }
}

MappedType.prototype = MappedTypeClass.prototype;
MappedType._applyMixin = () => undefined;
