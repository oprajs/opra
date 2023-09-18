import 'reflect-metadata';
import merge from 'putil-merge';
import * as vg from 'valgen';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { DataType } from './data-type.js';
import { SimpleTypeDecorator } from './simple-type.decorator.js';
import { SimpleTypeClass } from './simple-type-class.js'


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
  // Decorator
  if (!this) {
    const [options] = args;
    return SimpleType[DECORATOR](options);
  }
  // Constructor
  const [document, init] = args as [ApiDocument, SimpleType.InitArguments];
  merge(this, new SimpleTypeClass(document, init), {descriptor: true});
} as SimpleTypeConstructor;

SimpleType.prototype = SimpleTypeClass.prototype;
Object.assign(SimpleType, SimpleTypeDecorator);
SimpleType[DECORATOR] = SimpleTypeDecorator;

/**
 * @namespace SimpleType
 */
export namespace SimpleType {
  export interface InitArguments extends DataType.InitArguments {
    base?: SimpleType;
    decoder?: vg.Validator;
    encoder?: vg.Validator;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions {
    decoder?: vg.Validator;
    encoder?: vg.Validator;
  }

  export interface Metadata extends DataType.Metadata {
    decoder?: vg.Validator;
    encoder?: vg.Validator;
  }

  export interface OwnProperties extends DataType.OwnProperties {
  }

}

