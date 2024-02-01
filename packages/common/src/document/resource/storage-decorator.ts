import { Combine, StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { ApiActionDecorator, createActionDecorator } from './api-action.decorator.js';
import type { ApiAction } from './api-action.js';
import { createOperationDecorator } from './api-operation.decorator.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter';
import { ResourceDecorator } from './api-resource.decorator.js';
import type { ApiResponse } from './api-response';
import type { Storage } from './storage.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

export function StorageDecorator(options?: Storage.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Storage.Kind, options)
}

Object.assign(StorageDecorator, ResourceDecorator);


export interface StorageDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Storage.DecoratorOptions): ClassDecorator;

  Action: (options?: ApiAction.DecoratorOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ApiActionDecorator;

  Delete: typeof StorageDecorator.Delete;
  Get: typeof StorageDecorator.Get;
  Post: typeof StorageDecorator.Post;
}

/**
 * @namespace CollectionDecorator
 */
export namespace StorageDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.Storage, 'kind' | 'operations' | 'actions'> {
    kind: OpraSchema.Storage.Kind;
    name: string;
    actions?: Record<string, ApiAction.DecoratorMetadata>;
    operations?: {
      get: Get.Metadata;
      delete: Delete.Metadata;
      post: Post.Metadata;
    }
  }

  /**
   * @namespace Get
   */
  export namespace Get {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Storage.Operations.Get> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Storage.Operations.Get>> {
    }
  }

  /**
   * @namespace Delete
   */
  export namespace Delete {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Storage.Operations.Delete> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Storage.Operations.Delete>> {
    }
  }

  /**
   * @namespace Post
   */
  export namespace Post {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Storage.Operations.Post> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Storage.Operations.Post>> {
    }
  }

}

/*
 * Action PropertyDecorator
 */
export namespace StorageDecorator {

  /**
   * Action PropertyDecorator
   */
  export function Action(options: ApiOperation.DecoratorOptions): ApiActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, operationProperties, list);
  }

  /*
   * Delete PropertyDecorator
   */
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): DeleteDecorator;
  };

  export function Delete(options?: Delete.Options): DeleteDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createOperationDecorator<DeleteDecorator, Delete.Metadata>('delete', options, list);
  }


  /**
   * Get PropertyDecorator
   */
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): GetDecorator;
  };

  export function Get(options?: Get.Options): GetDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createOperationDecorator<GetDecorator, Get.Metadata>('get', options, list);
  }

  /**
   * Post PropertyDecorator
   */
  export type PostDecorator = ((target: Object, propertyKey: 'post') => void) & {
    Parameter(name: string, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): PostDecorator;
    MaxFields(amount: number): PostDecorator;
    MaxFieldSize(sizeInBytes: number): PostDecorator;
    MaxFiles(amount: number): PostDecorator;
    MaxFileSize(sizeInBytes: number): PostDecorator;
    MaxTotalFileSize(sizeInBytes: number): PostDecorator;
    MinFileSize(sizeInBytes: number): PostDecorator;
    Returns(args: ApiResponse.DecoratorOptions): PostDecorator;
    Returns(dataType: TypeThunkAsync | string): PostDecorator;
  };

  export function Post(options?: Post.Options): PostDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<PostDecorator, Post.Metadata>('post', options, list);
    decorator.MaxFields = (amount: number) => {
      list.push(operationMeta => operationMeta.options.maxFields = amount);
      return decorator;
    }
    decorator.MaxFieldSize = (amount: number) => {
      list.push(operationMeta => operationMeta.options.maxFieldsSize = amount);
      return decorator;
    }
    decorator.MaxFiles = (amount: number) => {
      list.push(operationMeta => operationMeta.options.maxFiles = amount);
      return decorator;
    }
    decorator.MaxFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.maxFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MaxTotalFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.maxTotalFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MinFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.options.minFileSize = sizeInBytes);
      return decorator;
    }
    decorator.Returns = (args: TypeThunkAsync | string | ApiResponse.DecoratorOptions) => {
      list.push(operationMeta => {
        operationMeta.response = typeof args === 'object' ? {...args} : {type: args};
      });
      return decorator;
    }
    return decorator;
  }
}
