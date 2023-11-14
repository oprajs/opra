import 'reflect-metadata';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexTypeDecorator } from './complex-type.decorator.js';
import { ComplexTypeClass } from './complex-type-class.js';
import { DataType } from './data-type.js';
import { ApiField } from './field.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * Callable class pattern for ComplexType
 */
export interface ComplexTypeConstructor {
  new(document: ApiDocument, init: ComplexType.InitArguments): ComplexType;

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
  const [document, init] = args as [ApiDocument, ComplexType.InitArguments];
  merge(this, new ComplexTypeClass(document, init), {descriptor: true});
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
    anonymous?: boolean;
  }

  export interface OwnProperties extends DataType.OwnProperties {
    ctor?: Type;
    additionalFields?: boolean | DataType | 'error';
    fields: ResponsiveMap<ApiField>;
    anonymous?: boolean;
  }

  export interface DecoratorOptions extends DataType.DecoratorOptions,
      Pick<InitArguments, 'ctor' | 'abstract'> {
    anonymous?: boolean;
    additionalFields?: boolean | 'error' | string | TypeThunkAsync;
  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType, 'fields'> {
    name: string;
    fields?: Record<string, ApiField.Metadata>;
  }

}

