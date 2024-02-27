import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ApiAction } from './api-action.js';
import type { ApiKeyParameter } from './api-key-parameter.js';
import type { ApiOperation } from './api-operation.js';
import { ApiResourceClass } from './api-resource.class.js';
import { createApiResourceDecorator } from './api-resource.decorator.js';


export interface ApiResourceConstructor extends createApiResourceDecorator {
  prototype: ApiResourceClass;

  new(parent: ApiDocument | ApiResource, name: string, init: ApiResource.InitArguments): ApiResourceClass;
}


export interface ApiResource extends ApiResourceClass {
}

/**
 * @class Collection
 * @decorator Collection
 */
export const ApiResource = function (this: ApiResourceClass | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args;
    return ApiResource[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [parent, name, init] = args as
      [ApiDocument | ApiResourceClass, string, ApiResource.InitArguments];
  merge(this, new ApiResourceClass(parent, name, init), {descriptor: true});
} as ApiResourceConstructor;

ApiResource.prototype = ApiResourceClass.prototype;
Object.assign(ApiResource, createApiResourceDecorator);
ApiResource[DECORATOR] = createApiResourceDecorator;


export namespace ApiResource {
  export interface InitArguments extends StrictOmit<OpraSchema.Resource, 'keyParameter' | 'kind' | 'endpoints' | 'resources'> {
    keyParameter?: ApiKeyParameter.InitArguments;
    endpoints?: Record<string, ApiAction.InitArguments | ApiOperation.InitArguments>;
    resources?: Record<string, ApiResource.InitArguments>;
    controller?: object;
    ctor?: Type;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Resource, 'keyParameter' | 'endpoints' | 'resources'> {
    name: string;
    keyParameter?: ApiKeyParameter.DecoratorMetadata;
    endpoints?: Record<string, ApiAction.DecoratorMetadata | ApiOperation.DecoratorMetadata>;
    resources?: Type[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Resource, 'kind' | 'keyParameter' | 'endpoints' | 'resources'>> {
    name?: string;
    resources?: TypeThunkAsync[];
  }

}
