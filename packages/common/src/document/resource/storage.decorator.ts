import { Combine, StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { ActionDecorator, createActionDecorator } from './action.decorator.js';
import { createOperationDecorator } from './operation.decorator.js';
import { ResourceDecorator } from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

export function StorageDecorator(options?: StorageDecorator.Options): ClassDecorator {
  return ResourceDecorator(OpraSchema.Storage.Kind, options)
}

Object.assign(StorageDecorator, ResourceDecorator);


export interface StorageDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: StorageDecorator.Options): ClassDecorator;

  Action: (options?: StorageDecorator.Action.Options) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ActionDecorator;

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
    actions?: Record<string, ResourceDecorator.EndpointMetadata>;
    operations?: {
      get: Get.Metadata;
      delete: Delete.Metadata;
      post: Post.Metadata;
    }
  }

  export interface Options extends Partial<StrictOmit<Metadata, 'operations' | 'actions'>> {
  }


  /**
   * @namespace Action
   */
  export namespace Action {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends ResourceDecorator.EndpointMetadata {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends ResourceDecorator.EndpointOptions {
    }
  }

  /**
   * @namespace Get
   */
  export namespace Get {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ResourceDecorator.EndpointMetadata, OpraSchema.Storage.Operations.Get> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ResourceDecorator.EndpointOptions,
        Partial<OpraSchema.Storage.Operations.Get>> {
    }
  }

  /**
   * @namespace Delete
   */
  export namespace Delete {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ResourceDecorator.EndpointMetadata, OpraSchema.Storage.Operations.Delete> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ResourceDecorator.EndpointOptions,
        Partial<OpraSchema.Storage.Operations.Delete>> {
    }
  }

  /**
   * @namespace Post
   */
  export namespace Post {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ResourceDecorator.EndpointMetadata, OpraSchema.Storage.Operations.Post> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ResourceDecorator.EndpointOptions,
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
  export function Action(options: ResourceDecorator.EndpointOptions): ActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, operationProperties, list);
  }

  /*
   * Delete PropertyDecorator
   */
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => DeleteDecorator;
  };

  export function Delete(options?: Delete.Options): DeleteDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createOperationDecorator<DeleteDecorator, Delete.Metadata>('delete', options, list);
  }


  /**
   * Get PropertyDecorator
   */
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => GetDecorator;
  };

  export function Get(options?: Get.Options): GetDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createOperationDecorator<GetDecorator, Get.Metadata>('get', options, list);
  }

  /**
   * Post PropertyDecorator
   */
  export type PostDecorator = ((target: Object, propertyKey: 'post') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => PostDecorator;
    MaxFields: (amount: number) => PostDecorator;
    MaxFieldSize: (sizeInBytes: number) => PostDecorator;
    MaxFiles: (amount: number) => PostDecorator;
    MaxFileSize: (sizeInBytes: number) => PostDecorator;
    MaxTotalFileSize: (sizeInBytes: number) => PostDecorator;
    MinFileSize: (sizeInBytes: number) => PostDecorator;
  };

  export function Post(options?: Post.Options): PostDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const decorator = createOperationDecorator<PostDecorator, Post.Metadata>('post', options, list);
    decorator.MaxFields = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFields = amount);
      return decorator;
    }
    decorator.MaxFieldSize = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFieldsSize = amount);
      return decorator;
    }
    decorator.MaxFiles = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFiles = amount);
      return decorator;
    }
    decorator.MaxFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.maxFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MaxTotalFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.maxTotalFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MinFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.minFileSize = sizeInBytes);
      return decorator;
    }
    return decorator;
  }
}
