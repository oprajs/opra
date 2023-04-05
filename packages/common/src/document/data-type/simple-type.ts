import omit from 'lodash.omit';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY, TYPENAME_PATTERN } from '../constants.js';
import { DataType } from './data-type.js';

export namespace SimpleType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.SimpleType, 'ctor' | 'pattern' | 'codec'> {
    base?: SimpleType;
  }

  export interface OwnProperties extends DataType.OwnProperties,
      Readonly<Pick<OpraSchema.SimpleType, 'ctor' | 'pattern' | 'codec'>> {

  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'pattern'> {

  }

  export interface Metadata extends OpraSchema.SimpleType {
    name: string;
  }
}

export interface SimpleType extends StrictOmit<DataType, 'own' | 'exportSchema'>, SimpleType.OwnProperties {
  readonly ctor: Type;
  readonly base?: SimpleType;
  readonly own: SimpleType.OwnProperties;

  exportSchema(): OpraSchema.SimpleType;

  decode(value: any): any;

  encode(value: any): any;
}

export interface SimpleTypeConstructor {
  new(document: ApiDocument, init?: SimpleType.InitArguments): SimpleType;

  (init?: SimpleType.DecoratorOptions): ClassDecorator;

  prototype: SimpleType;
}

/**
 * @class SimpleType
 */
export const SimpleType = function (this: SimpleType | void, ...args: any[]) {
  // ClassDecorator
  if (!this) {
    const [options] = args as [SimpleType.DecoratorOptions | undefined];
    return function (target: Function) {
      let name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
      name = name.charAt(0).toLowerCase() + name.substring(1);
      const metadata: SimpleType.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
      metadata.kind = OpraSchema.SimpleType.Kind;
      metadata.name = name;
      if (options)
        Object.assign(metadata, omit(options, ['kind', 'name', 'base']));
      Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }
  }

  // Constructor
  const [, options] = args as [never, SimpleType.InitArguments | undefined];

  // call super()
  DataType.apply(this, args);
  const _this = this as Writable<SimpleType>;
  _this.kind = OpraSchema.SimpleType.Kind;
  _this.base = options?.base;
  const own = _this.own as Writable<SimpleType.OwnProperties>;
  own.codec = options?.codec;
  own.ctor = options?.ctor;
  if (options?.pattern)
    own.pattern = (options?.pattern instanceof RegExp ? options.pattern : new RegExp(options.pattern));

  const ctor = own.ctor || _this.base?.ctor;
  _this.ctor = ctor || Object;
  _this.decode = own.codec?.decode || _this.base?.decode || ((v) => v);
  _this.encode = own.codec?.encode || _this.base?.encode || ((v) => v);
  _this.coerce = own.codec?.coerce || _this.base?.coerce || ((v) => v);
  _this.validate = own.codec?.validate || _this.base?.validate || (() => true);
  _this.pattern = own.pattern || _this.base?.pattern;

} as SimpleTypeConstructor;

const proto = {

  exportSchema(): OpraSchema.SimpleType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.SimpleType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      codec: this.own.codec,
      pattern: this.own.pattern
    }));
    return out;
  }

} as SimpleType;

Object.assign(SimpleType.prototype, proto);
Object.setPrototypeOf(SimpleType.prototype, DataType.prototype);
