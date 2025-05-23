import 'reflect-metadata';
import { omitUndefined } from '@jsopen/objects';
import type { Class, Combine, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import {
  inheritPropertyInitializers,
  mergePrototype,
} from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { DocumentElement } from '../common/document-element.js';
import type { DocumentInitContext } from '../common/document-init-context.js';
import { DATATYPE_METADATA, DECORATOR } from '../constants.js';
import { ApiField } from './api-field.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeBase } from './complex-type-base.js';
import { DataType } from './data-type.js';
import type { MappedType } from './mapped-type.js';

/**
 * @namespace MixinType
 */
export namespace MixinType {
  export interface Metadata
    extends Combine<
      {
        kind: OpraSchema.MixinType.Kind;
        name?: string;
        types: Type[];
      },
      DataType.Metadata,
      Pick<ComplexType.Metadata, 'additionalFields'>,
      OpraSchema.MixinType
    > {}

  export interface InitArguments
    extends Combine<
      {
        kind: OpraSchema.MixinType.Kind;
        types: (ComplexType | MappedType | MixinType)[];
        ctor?: Type;
      },
      DataType.InitArguments,
      MixinType.Metadata
    > {}
}

/**
 * Type definition for MixinType
 * @class MixinType
 */
export interface MixinTypeStatic {
  /**
   * Class constructor of MixinType
   *
   * @param owner
   * @param args
   * @constructor
   */
  new (owner: DocumentElement, args: MixinType.InitArguments): MixinType;

  /**
   * Create a new mixin type from given two types
   * @param types
   * @param options
   */ <A1 extends any[], I1, S1, A2 extends any[], I2, S2>(
    types: [Class<A1, I1, S1>, Class<A2, I2, S2>],
    options?: DataType.Options,
  ): Class<any[], I1 & I2, S1 & S2>;

  /**
   * Helper method that mixes given types
   * @param types
   * @param options
   */ <
    A1 extends any[],
    I1,
    S1,
    A2 extends any[],
    I2,
    S2,
    A3 extends any[],
    I3,
    S3,
  >(
    types: [Class<A1, I1, S1>, Class<A2, I2, S2>, Class<A3, I3, S3>],
    options?: DataType.Options,
  ): Class<any[], I1 & I2 & I3, S1 & S2 & S3>;

  /**
   * Helper method that mixes given types
   * @param types
   * @param options
   */ <
    A1 extends any[],
    I1,
    S1,
    A2 extends any[],
    I2,
    S2,
    A3 extends any[],
    I3,
    S3,
    A4 extends any[],
    I4,
    S4,
  >(
    types: [
      Class<A1, I1, S1>,
      Class<A2, I2, S2>,
      Class<A3, I3, S3>,
      Class<A4, I4, S4>,
    ],
    options?: DataType.Options,
  ): Class<any[], I1 & I2 & I3 & I4, S1 & S2 & S3 & S4>;

  /**
   * Helper method that mixes given types
   * @param types
   * @param options
   */ <
    A1 extends any[],
    I1,
    S1,
    A2 extends any[],
    I2,
    S2,
    A3 extends any[],
    I3,
    S3,
    A4 extends any[],
    I4,
    S4,
    A5 extends any[],
    I5,
    S5,
  >(
    types: [
      Class<A1, I1, S1>,
      Class<A2, I2, S2>,
      Class<A3, I3, S3>,
      Class<A4, I4, S4>,
      Class<A5, I5, S5>,
    ],
    options?: DataType.Options,
  ): Class<any[], I1 & I2 & I3 & I4 & I5, S1 & S2 & S3 & S4 & S5>;

  prototype: MixinType;
}

/**
 * Type definition of MixinType prototype
 * @interface
 */
export interface MixinType extends MixinTypeClass {}

/**
 * @class MixinType
 */
export const MixinType = function (this: MixinType, ...args: any[]) {
  // MixinType factory
  if (!this) {
    return MixinType[DECORATOR].apply(undefined, args);
  }
  // Constructor
  const [owner, initArgs, context] = args as [
    DocumentElement,
    MixinType.InitArguments,
    DocumentInitContext | undefined,
  ];
  ComplexTypeBase.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.kind = OpraSchema.MixinType.Kind;
  _this.types = [];
  for (const base of initArgs.types) {
    if (_this.additionalFields !== true) {
      if (base.additionalFields === true) _this.additionalFields = true;
      else if (!_this.additionalFields)
        _this.additionalFields = base.additionalFields;
    }
    for (const v of base.fields('*')) {
      const field = new ApiField(this, v);
      (_this as any)._fields.set(field.name, field);
    }
    _this.types.push(base);
    if (base.keyField) _this.keyField = base.keyField;
  }
} as MixinTypeStatic;

/**
 *
 * @class MixinType
 */
class MixinTypeClass extends ComplexTypeBase {
  declare readonly kind: OpraSchema.MixinType.Kind;
  declare readonly types: (ComplexType | MixinType | MappedType)[];

  extendsFrom(baseType: DataType | string | Type | object): boolean {
    if (!(baseType instanceof DataType))
      baseType = this.node.getDataType(baseType);
    if (!(baseType instanceof ComplexTypeBase)) return false;
    if (baseType === this) return true;
    for (const t of this.types) {
      if (t.extendsFrom(baseType)) return true;
    }
    return false;
  }

  toJSON(options?: ApiDocument.ExportOptions): OpraSchema.MixinType {
    const superJson = super.toJSON(options);
    return omitUndefined<OpraSchema.MixinType>({
      ...superJson,
      kind: this.kind as any,
      types: this.types.map(base => {
        const baseName = this.node.getDataTypeNameWithNs(base);
        return baseName ? baseName : base.toJSON(options);
      }),
    });
  }

  protected _locateBase(
    callback: (base: ComplexTypeBase) => boolean,
  ): ComplexTypeBase | undefined {
    for (const t of this.types) {
      if (callback(t)) return t;
      if ((t as any)._locateBase) {
        const x = (t as any)._locateBase(callback);
        if (x) return x;
      }
    }
  }
}

MixinType.prototype = MixinTypeClass.prototype;
MixinType[DECORATOR] = MixinTypeFactory;

/**
 *
 */
function MixinTypeFactory(clasRefs: Type[], options?: DataType.Options): Type {
  // Filter undefined items
  clasRefs = clasRefs.filter(x => typeof x === 'function') as [Type];
  if (!clasRefs.length) throw new TypeError('No Class has been provided');
  if (clasRefs.length === 1) return clasRefs[0] as any;
  const className = clasRefs[0].name + 'Mixin';

  const MixinClass = {
    [className]: class {
      constructor() {
        for (const c of clasRefs) inheritPropertyInitializers(this, c);
      }
    },
  }[className];

  const metadata: MixinType.Metadata = {
    ...options,
    kind: OpraSchema.MixinType.Kind,
    types: [],
  };
  Reflect.defineMetadata(DATATYPE_METADATA, metadata, MixinClass);

  for (const c of clasRefs) {
    const itemMeta = Reflect.getMetadata(DATATYPE_METADATA, c);
    if (
      !(
        itemMeta &&
        (itemMeta.kind === OpraSchema.ComplexType.Kind ||
          itemMeta.kind === OpraSchema.MixinType.Kind ||
          itemMeta.kind === OpraSchema.MappedType.Kind)
      )
    ) {
      throw new TypeError(
        `Class "${c.name}" is not a ${OpraSchema.ComplexType.Kind}, ${OpraSchema.MixinType.Kind} or ${OpraSchema.MappedType.Kind}`,
      );
    }
    metadata.types.push(c);
    mergePrototype(MixinClass.prototype, c.prototype);
  }

  return MixinClass as any;
}
