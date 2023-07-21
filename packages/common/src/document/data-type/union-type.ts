import 'reflect-metadata';
import merge from 'putil-merge';
import { Class, StrictOmit, Type, Writable } from 'ts-gems';
import * as vg from 'valgen';
import {
  inheritPropertyInitializers,
  mergePrototype,
  omitUndefined,
  ResponsiveMap
} from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { ApiField } from './api-field.js';
import { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { MappedType } from './mapped-type.js';

/**
 * @namespace UnionType
 */
export namespace UnionType {

  export interface InitArguments extends DataType.InitArguments {
    types: (ComplexType | UnionType | MappedType)[]
  }

  export interface OwnProperties extends DataType.OwnProperties {
    types: (ComplexType | UnionType | MappedType)[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.UnionType, 'types'> {
    types: Type[];
  }
}

class UnionTypeClass extends DataType {
  readonly kind = OpraSchema.UnionType.Kind;
  readonly own: UnionType.OwnProperties;
  readonly types: (ComplexType | UnionType | MappedType)[];
  readonly additionalFields?: boolean;
  readonly fields: ResponsiveMap<ApiField>;
  protected _decoder: vg.Validator<any, any>;
  protected _encoder: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: UnionType.InitArguments) {
    super(document, init);
    this.fields = new ResponsiveMap();
    const own = this.own as Writable<UnionType.OwnProperties>
    own.types = [];

    for (const base of init.types) {
      if (!(base instanceof ComplexType || base instanceof UnionType || base instanceof MappedType))
        throw new TypeError(`${OpraSchema.UnionType.Kind} shall contain ${OpraSchema.ComplexType.Kind}, ` +
            `${OpraSchema.UnionType.Kind} of ${OpraSchema.MappedType.Kind} types.`);
      own.types.push(base);
      if (base.additionalFields)
        this.additionalFields = true;
      this.fields.setAll(base.fields);
    }

    this.types = [...own.types];
  }

  exportSchema(): OpraSchema.UnionType {
    const out = super.exportSchema() as OpraSchema.UnionType;
    Object.assign(out, omitUndefined({
      types: this.own.types.map(t => t.name ? t.name : t.exportSchema())
    }));
    return out;
  }

  protected _getDecoder(): vg.Validator<any, any> {
    if (this._decoder)
      return this._decoder;
    const schema: vg.ObjectSchema = {};
    for (const f of this.fields.values()) {
      let t = (f.type as any).getDecoder();
      if (f.isArray)
        t = vg.isArray(t);
      schema[f.name] = t;
    }
    this._decoder = vg.isObject(schema, {
      additionalFields: this.additionalFields,
      name: this.name,
      caseInSensitive: true
    });
    return this._decoder;
  }

  protected _getEncoder(): vg.Validator<any, any> {
    if (this._encoder)
      return this._encoder;
    const schema: vg.ObjectSchema = {};
    for (const f of this.fields.values()) {
      let t = (f.type as any).getEncoder();
      if (f.isArray)
        t = vg.isArray(t);
      schema[f.name] = t;
    }
    this._encoder = vg.isObject(schema, {
      additionalFields: this.additionalFields,
      name: this.name,
      caseInSensitive: true,
      detectCircular: true
    });
    return this._encoder;
  }
}

/**
 * Type definition of UnionType constructor type
 * @type UnionTypeConstructor
 */
export interface UnionTypeConstructor {
  prototype: UnionType;

  new(document: ApiDocument, init: UnionType.InitArguments): UnionType;

  <A1 extends any[], I1, S1,
      A2 extends any[], I2, S2,
      A3 extends any[], I3, S3,
      A4 extends any[], I4, S4,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >(
      c1: Class<A1, I1, S1>,
      c2: Class<A2, I2, S2>,
      c3?: Class<A3, I3, S3>,
      c4?: Class<A4, I4, S4>
  ): Class<any[], I1 & I2 & I3 & I4, S1 & S2 & S3 & S4>;

  _applyMixin(target: Type, ...sources: [Type]): void;
}

/**
 * Type definition of UnionType prototype
 * @type UnionType
 */
export interface UnionType extends UnionTypeClass {
}


/**
 * @class UnionType
 */
export const UnionType = function (
    this: UnionType,
    ...args: any[]
) {

  // Constructor
  if (this) {
    const [document, init] = args as [ApiDocument, UnionType.InitArguments];
    merge(this, new UnionTypeClass(document, init), {descriptor: true});
    return;
  }

  // UnionType helper

  // Filter undefined items
  const clasRefs = [...args].filter(x => !!x) as [Type];
  if (!clasRefs.length)
    throw new TypeError('No Class has been provided');
  if (clasRefs.length === 1)
    return clasRefs[0] as any;

  class UnionClass {
    constructor() {
      for (const c of clasRefs)
        inheritPropertyInitializers(this, c);
    }
  }

  const metadata: UnionType.Metadata = {
    kind: OpraSchema.UnionType.Kind,
    types: []
  };
  Reflect.defineMetadata(METADATA_KEY, metadata, UnionClass);

  for (const c of clasRefs) {
    const itemMeta = Reflect.getMetadata(METADATA_KEY, c);
    if (!(itemMeta && (itemMeta.kind === OpraSchema.ComplexType.Kind || itemMeta.kind === OpraSchema.UnionType.Kind ||
        itemMeta.kind === OpraSchema.MappedType.Kind)))
      throw new TypeError(`Class "${c.name}" is not a ${OpraSchema.ComplexType.Kind}, ${OpraSchema.UnionType.Kind} or ${OpraSchema.MappedType.Kind}`);
    metadata.types.push(c);
    mergePrototype(UnionClass.prototype, c.prototype);
  }

  UnionType._applyMixin(UnionClass, ...clasRefs);

  return UnionClass as any;
} as UnionTypeConstructor;

UnionType.prototype = UnionTypeClass.prototype;

UnionType._applyMixin = () => void 0;
