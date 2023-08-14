import 'reflect-metadata';
import omit from 'lodash.omit';
import merge from 'putil-merge';
import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY, TYPENAME_PATTERN } from '../constants.js';
import { DataType } from './data-type.js';

export namespace SimpleType {
  export interface InitArguments extends DataType.InitArguments {
    base?: SimpleType;
    decoder?: vg.Validator<any, any>;
    encoder?: vg.Validator<any, any>;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions {
    decoder?: vg.Validator<any, any>;
    encoder?: vg.Validator<any, any>;
  }

  export interface Metadata extends DataType.Metadata {
    decoder?: vg.Validator<any, any>;
    encoder?: vg.Validator<any, any>;
  }

  export interface OwnProperties extends DataType.OwnProperties {
  }

}

/**
 * @class SimpleType
 */
class SimpleTypeClass extends DataType {
  readonly kind = OpraSchema.SimpleType.Kind
  readonly base?: SimpleType;
  readonly own: SimpleType.OwnProperties;
  readonly decode: vg.Validator<any, any>;
  readonly encode: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: SimpleType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.decode = init.decoder || init.base?.decode || vg.isAny();
    this.encode = init.encoder || init.base?.encode || vg.isAny();
  }

  exportSchema(): OpraSchema.SimpleType {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.exportSchema() as OpraSchema.SimpleType;
    // Object.assign(out, omitUndefined({
    //   base: this.base ?
    //       (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
    // }));
    return out;
  }

}

export interface SimpleTypeConstructor {
  new(document: ApiDocument, init: SimpleType.InitArguments): SimpleType;

  (options?: SimpleType.DecoratorOptions): (target: any) => any;

  prototype: SimpleType;
}

export interface SimpleType extends SimpleTypeClass {
}

/**
 * @class SimpleType
 */
export const SimpleType = function (this: SimpleType | void, ...args: any[]) {
  // Constructor
  if (this) {
    const [document, init] = args as [ApiDocument, SimpleType.InitArguments];
    merge(this, new SimpleTypeClass(document, init), {descriptor: true});
    return;
  }

  // ClassDecorator
  const [options] = args as [SimpleType.DecoratorOptions | undefined];
  return function (target: Function) {
    let name = options?.name || target.name.match(TYPENAME_PATTERN)?.[1] || target.name;
    name = name.charAt(0).toLowerCase() + name.substring(1);
    const metadata: SimpleType.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
    metadata.kind = OpraSchema.SimpleType.Kind;
    metadata.name = name;
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name']));
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
  }

} as SimpleTypeConstructor;

SimpleType.prototype = SimpleTypeClass.prototype;
