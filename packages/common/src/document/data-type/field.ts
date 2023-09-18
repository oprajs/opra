import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { DECORATOR } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { EnumType } from './enum-type.js';
import { FieldClass } from './field-class.js';
import { FieldDecorator } from './field-decorator.js';

/**
 * Type definition of ComplexType constructor type
 * @type FieldConstructor
 */
export interface FieldConstructor extends FieldDecorator {
  prototype: FieldClass;

  new(owner: ComplexType, init: ApiField.InitArguments): FieldClass;
}

export interface ApiField extends FieldClass {
}

/**
 * @class ApiField
 * @decorator ApiField
 */
export const ApiField = function (this: ApiField | void, ...args: any[]) {
  // Decorator
  if (!this) {
    const [options] = args;
    return ApiField[DECORATOR](options);
  }
  // Constructor
  const [owner, init] = args as [ComplexType, ApiField.InitArguments];
  merge(this, new FieldClass(owner, init), {descriptor: true});
} as FieldConstructor;

ApiField.prototype = FieldClass.prototype;
Object.assign(ApiField, FieldDecorator);
ApiField[DECORATOR] = FieldDecorator;


/**
 * @namespace ApiField
 */
export namespace ApiField {
  export interface InitArguments extends StrictOmit<OpraSchema.Field, 'type'> {
    name: string;
    type: DataType;
    origin?: ComplexType;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Field, 'isArray' | 'type'>> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface Metadata extends StrictOmit<OpraSchema.Field, 'type'> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
    designType?: Type;
  }
}
