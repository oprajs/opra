import merge from 'putil-merge';
import { StrictOmit, Type, TypeThunkAsync } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { DECORATOR } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import type { DataType } from './data-type.js';
import { FieldDecorator } from './decorators/field-decorator.js';
import type { EnumType } from './enum-type.js';
import { FieldClass } from './field-class.js';

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
  export interface InitArguments extends StrictOmit<OpraSchema.Field, 'type' | 'pattern'> {
    name: string;
    type: DataType;
    designType?: Type;
    origin?: ComplexType;
    pattern?: string | RegExp;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Field, 'type' | 'pattern'>> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
    pattern?: string | RegExp;
  }

  export interface Metadata extends StrictOmit<OpraSchema.Field, 'type' | 'pattern'> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
    designType?: Type;
    pattern?: string | RegExp;
  }
}
