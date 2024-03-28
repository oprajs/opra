import 'reflect-metadata';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { DECORATOR } from '../constants.js';
import { DataType } from './data-type';
import { createAttributeDecorator, createSimpleTypeDecorator } from './decorators/simple-type.decorator.js';
import { SimpleTypeClass } from './simple-type-class.js'


export interface SimpleTypeConstructor extends createSimpleTypeDecorator {
  new(node: ApiNode, init: SimpleType.InitArguments): SimpleType;

  prototype: SimpleType;

  Attribute(options?: Partial<OpraSchema.Attribute>): PropertyDecorator;
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
  const [node, init] = args as [ApiNode, SimpleType.InitArguments];
  merge(this, new SimpleTypeClass(node, init), {descriptor: true});
} as SimpleTypeConstructor;

SimpleType.prototype = SimpleTypeClass.prototype;
Object.assign(SimpleType, createSimpleTypeDecorator);
SimpleType[DECORATOR] = createSimpleTypeDecorator;


SimpleType.Attribute = createAttributeDecorator;


/**
 * @namespace SimpleType
 */
export namespace SimpleType {
  export interface InitArguments extends StrictOmit<DataType.InitArguments, 'base'> {
    name: string;
    base?: SimpleType;
    instance?: object;
    attributes?: Record<string, Attribute>;
  }

  export interface DecoratorOptions extends Pick<InitArguments, 'description' | 'example'> {
    name?: string;
  }

  export interface Metadata extends StrictOmit<OpraSchema.SimpleType, 'attributes'> {
    name: string;
    attributes?: Record<string, OpraSchema.Attribute>;
  }

  export interface OwnProperties extends DataType.OwnProperties {
    attributes?: Record<string, Attribute>;
    instance?: object;
  }

  export interface Attribute extends OpraSchema.Attribute {
    value?: any;
  }


}
