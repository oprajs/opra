import 'reflect-metadata';
import type { Combine, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { isAny, type Validator } from 'valgen';
import { cloneObject, omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { DocumentElement } from '../common/document-element';
import { DocumentInitContext } from '../common/document-init-context.js';
import { DECORATOR } from '../constants.js';
import { AttributeDecoratorFactory, SimpleTypeDecoratorFactory } from '../decorators/simple-type.decorator.js';
import { DataType } from './data-type.js';

/**
 * @namespace SimpleType
 */
export namespace SimpleType {
  export interface Metadata
    extends Combine<
      {
        kind: OpraSchema.SimpleType.Kind;
      },
      DataType.Metadata,
      OpraSchema.SimpleType
    > {}

  export interface Options extends Combine<Pick<OpraSchema.SimpleType, 'nameMappings'>, DataType.Options> {}

  export interface InitArguments
    extends Combine<
      {
        kind: OpraSchema.SimpleType.Kind;
        base?: SimpleType;
        ctor?: Type;
        properties?: object;
        generateDecoder?: SimpleType.ValidatorGenerator;
        generateEncoder?: SimpleType.ValidatorGenerator;
      },
      DataType.InitArguments,
      SimpleType.Metadata
    > {}

  export interface Attribute extends OpraSchema.Attribute {}

  export type ValidatorGenerator = (properties: Record<string, any>, element: DocumentElement) => Validator;
}

/**
 * Type definition for MixinType
 * @class SimpleType
 */
export interface SimpleTypeStatic extends SimpleTypeDecoratorFactory {
  /**
   * Class constructor of SimpleType
   *
   * @param owner
   * @param initArgs
   * @param context
   * @constructor
   */
  new (owner: DocumentElement, initArgs: SimpleType.InitArguments, context?: DocumentInitContext): SimpleType;

  prototype: SimpleType;

  Attribute: AttributeDecoratorFactory;
}

/**
 * Type definition of SimpleType prototype
 * @interface SimpleType
 */
export interface SimpleType extends SimpleTypeClass {}

/**
 * SimpleType constructor
 */
export const SimpleType = function (this: SimpleType | void, ...args: any[]) {
  // Decorator
  if (!this) return SimpleType[DECORATOR](...args);
  // Constructor
  const [owner, initArgs, context] = args as [
    DocumentElement,
    SimpleType.InitArguments,
    DocumentInitContext | undefined,
  ];
  DataType.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.kind = OpraSchema.SimpleType.Kind;
  if (initArgs.base) {
    // noinspection SuspiciousTypeOfGuard
    if (!(initArgs.base instanceof SimpleType)) {
      throw new TypeError(`"${(initArgs.base as DataType).kind}" can't be set as base for a "${this.kind}"`);
    }
    _this.base = initArgs.base;
  }

  _this.properties = initArgs.properties;
  _this.ownNameMappings = { ...initArgs.nameMappings };
  _this.nameMappings = { ..._this.base?.nameMappings, ...initArgs.nameMappings };
  _this.ownAttributes = cloneObject(initArgs.attributes || {});
  _this.attributes = _this.base ? cloneObject(_this.base.attributes) : {};
  if (_this.ownAttributes) {
    for (const [k, el] of Object.entries(_this.ownAttributes)) {
      if (_this.attributes[k]?.sealed) throw new TypeError(`Sealed attribute "${k}" can not be overwritten`);
      _this.attributes[k] = el;
    }
  }
  (_this as any)._generateDecoder = initArgs.generateDecoder;
  (_this as any)._generateEncoder = initArgs.generateEncoder;
} as SimpleTypeStatic;

/**
 *
 * @class SimpleType
 */
abstract class SimpleTypeClass extends DataType {
  declare readonly kind: OpraSchema.SimpleType.Kind;
  declare readonly base?: SimpleType;
  declare readonly attributes: Record<string, SimpleType.Attribute>;
  declare readonly nameMappings: Record<string, string>;
  declare readonly ownAttributes: Record<string, SimpleType.Attribute>;
  declare readonly ownNameMappings: Record<string, string>;
  protected _generateDecoder?: SimpleType.ValidatorGenerator;
  protected _generateEncoder?: SimpleType.ValidatorGenerator;
  properties?: any;

  extendsFrom(baseType: DataType | string | Type | object): boolean {
    if (!(baseType instanceof DataType)) baseType = this.node.getDataType(baseType);
    if (!(baseType instanceof SimpleType)) return false;
    if (baseType === this) return true;
    return !!this.base?.extendsFrom(baseType);
  }

  generateCodec<T extends Record<string, any> | object = object>(
    codec: 'encode' | 'decode',
    options?: DataType.GenerateCodecOptions | null,
    properties?: Partial<T>,
  ): Validator {
    const prop = {
      ...this.properties,
      ...properties,
    };
    if (codec === 'decode') {
      let t: SimpleType | undefined = this;
      while (t) {
        if (t._generateDecoder) return t._generateDecoder(prop, options?.documentElement || this.owner);
        t = this.base;
      }
      return isAny;
    }
    let t: SimpleType | undefined = this;
    while (t) {
      if (t._generateEncoder) return t._generateEncoder(prop, options?.documentElement || this.owner);
      t = this.base;
    }
    return isAny;
  }

  toJSON(): OpraSchema.SimpleType {
    const attributes = omitUndefined<any>(this.ownAttributes);
    let properties: any;
    if (this.properties && typeof this.properties.toJSON === 'function') {
      properties = this.properties.toJSON(this.properties, this.owner);
    } else properties = this.properties ? cloneObject(this.properties) : {};
    const baseName = this.base ? this.node.getDataTypeNameWithNs(this.base) : undefined;
    const out = omitUndefined<OpraSchema.SimpleType>({
      ...(DataType.prototype.toJSON.apply(this) as any),
      base: this.base ? (baseName ? baseName : this.base.toJSON()) : undefined,
      attributes: attributes && Object.keys(attributes).length ? attributes : undefined,
      properties: Object.keys(properties).length ? properties : undefined,
    });
    if (Object.keys(this.ownNameMappings).length) out.nameMappings = { ...this.ownNameMappings };
    return out;
  }
}

SimpleType.prototype = SimpleTypeClass.prototype;
Object.assign(SimpleType, SimpleTypeDecoratorFactory);
SimpleType[DECORATOR] = SimpleTypeDecoratorFactory;
SimpleType.Attribute = AttributeDecoratorFactory;
