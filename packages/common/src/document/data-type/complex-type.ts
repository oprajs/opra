import 'reflect-metadata';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiNode } from '../api-node';
import { DECORATOR } from '../constants.js';
import { ComplexTypeClass } from './complex-type-class.js';
import { DataType } from './data-type.js';
import { ComplexTypeDecorator } from './decorators/complex-type.decorator.js';
import { ApiField } from './field.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * Callable class pattern for ComplexType
 */
export interface ComplexTypeConstructor {
  new(node: ApiNode, init: ComplexType.InitArguments): ComplexType;

  (options?: ComplexType.DecoratorOptions): ClassDecorator;

  prototype: ComplexType;
}

export interface ComplexType extends ComplexTypeClass {
}


/**
 * @class ComplexType
 * @decorator ComplexType
 */
export const ComplexType = function (
    this: ComplexType | void, ...args: any[]
) {
  // Decorator
  if (!this) {
    const [options] = args;
    return ComplexType[DECORATOR](options);
  }
  // Constructor
  const [node, init] = args as [ApiNode, ComplexType.InitArguments];
  merge(this, new ComplexTypeClass(node, init), {descriptor: true});
} as ComplexTypeConstructor;

ComplexType.prototype = ComplexTypeClass.prototype;
Object.assign(ComplexType, ComplexTypeDecorator);
ComplexType[DECORATOR] = ComplexTypeDecorator;


/**
 * @namespace ComplexType
 */
export namespace ComplexType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.ComplexType, 'ctor' | 'abstract'> {
    base?: ComplexType | MappedType | MixinType;
    fields?: Record<string, ApiField.InitArguments>;
    additionalFields?: boolean | DataType | 'error';
    embedded?: boolean;
  }

  export interface OwnProperties extends DataType.OwnProperties {
    ctor?: Type;
    additionalFields?: boolean | DataType | 'error';
    fields: ResponsiveMap<ApiField>;
    embedded?: boolean;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'abstract'> {
    embedded?: boolean;
    additionalFields?: boolean | 'error' | string | TypeThunkAsync;
  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType, 'fields'> {
    name: string;
    fields?: Record<string, ApiField.Metadata>;
  }

}

