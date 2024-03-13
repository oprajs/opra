import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { createHttpResourceDecorator } from './decorators/http-resource.decorator.js';
import { HttpAction } from './http-action.js';
import type { HttpKeyParameter } from './http-key-parameter';
import type { HttpOperation } from './http-operation';
import { HttpResourceClass } from './http-resource.class.js';


export interface HttpResourceConstructor extends createHttpResourceDecorator {
  prototype: HttpResourceClass;

  new(parent: ApiDocument | HttpResource, name: string, init: HttpResource.InitArguments): HttpResourceClass;
}


export interface HttpResource extends HttpResourceClass {
}

/**
 * @class Collection
 * @decorator Collection
 */
export const HttpResource = function (this: HttpResourceClass | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args;
    return HttpResource[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [parent, name, init] = args as
      [ApiDocument | HttpResourceClass, string, HttpResource.InitArguments];
  merge(this, new HttpResourceClass(parent, name, init), {descriptor: true});
} as HttpResourceConstructor;

HttpResource.prototype = HttpResourceClass.prototype;
Object.assign(HttpResource, createHttpResourceDecorator);
HttpResource[DECORATOR] = createHttpResourceDecorator;


export namespace HttpResource {
  export interface InitArguments extends Pick<OpraSchema.Http.Resource, 'description'> {
    controller?: object;
    ctor?: Type;
  }

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.Http.Resource, 'keyParameter' | 'endpoints' | 'resources' | 'types'> {
    name: string;
    keyParameter?: HttpKeyParameter.DecoratorMetadata;
    endpoints?: Record<string, HttpAction.DecoratorMetadata | HttpOperation.DecoratorMetadata>;
    resources?: TypeThunkAsync[];
    types?: TypeThunkAsync[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Http.Resource, 'kind' | 'keyParameter' | 'endpoints' | 'resources'>> {
    name?: string;
    resources?: TypeThunkAsync[];
  }

}
