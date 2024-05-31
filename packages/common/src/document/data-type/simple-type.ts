import 'reflect-metadata';
import { asMutable, Combine, Type } from 'ts-gems';
import { isAny, Validator } from 'valgen';
import { cloneObject, omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { DocumentElement } from '../common/document-element';
import { DocumentInitContext } from '../common/document-init-context.js';
import { DECORATOR } from '../constants.js';
import { DataType } from './data-type.js';
import { AttributeDecoratorFactory, SimpleTypeDecoratorFactory } from './decorators/simple-type.decorator.js';

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

  export interface Options extends DataType.Options {}

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
    if (!(initArgs.base instanceof SimpleType))
      throw new TypeError(`"${(initArgs.base as DataType).kind}" can't be set as base for a "${this.kind}"`);
    _this.base = initArgs.base;
  }

  _this.properties = initArgs.properties;
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
  readonly kind: OpraSchema.SimpleType.Kind;
  readonly base?: SimpleType;
  readonly attributes: Record<string, SimpleType.Attribute>;
  readonly ownAttributes: Record<string, SimpleType.Attribute>;
  protected _generateDecoder?: SimpleType.ValidatorGenerator;
  protected _generateEncoder?: SimpleType.ValidatorGenerator;
  properties?: any;

  extendsFrom(baseType: DataType): boolean {
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
        if (t._generateDecoder) return t._generateDecoder(prop, options?.documentPath || this.owner);
        t = this.base;
      }
      return isAny;
    } else {
      let t: SimpleType | undefined = this;
      while (t) {
        if (t._generateEncoder) return t._generateEncoder(prop, options?.documentPath || this.owner);
        t = this.base;
      }
      return isAny;
    }
  }

  toJSON(): OpraSchema.SimpleType {
    const attributes = omitUndefined<any>(this.ownAttributes);
    let properties: any;
    if (this.properties && typeof this.properties.toJSON === 'function') {
      properties = this.properties.toJSON(this.properties, this.owner);
    } else properties = this.properties || {};
    properties = Object.keys(this.attributes).reduce((o, k) => {
      if (properties[k] !== undefined) o[k] = properties[k];
      return o;
    }, {});
    return omitUndefined<OpraSchema.SimpleType>({
      ...(DataType.prototype.toJSON.apply(this) as any),
      base: this.base ? (this.base.name ? this.base.name : this.base.toJSON()) : undefined,
      attributes: attributes && Object.keys(attributes).length ? attributes : undefined,
      properties: Object.keys(properties).length ? properties : undefined,
    });
  }
}

SimpleType.prototype = SimpleTypeClass.prototype;
Object.assign(SimpleType, SimpleTypeDecoratorFactory);
SimpleType[DECORATOR] = SimpleTypeDecoratorFactory;
SimpleType.Attribute = AttributeDecoratorFactory;
