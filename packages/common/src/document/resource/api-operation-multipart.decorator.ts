import { StrictOmit } from 'ts-gems';
import { ApiOperationDecorator, createOperationDecorator } from './api-operation.decorator.js';
import { ApiOperation } from './api-operation.js';

/** Augmentation **/
declare module './api-operation.js' {

  /**
   * ApiOperationConstructor
   */
  interface ApiOperationConstructor {
    Multipart: ApiOperationMultipart;
  }

  interface ApiOperationMultipart {
    Get(options?: ApiOperation.Multipart.Get.Options): ApiOperation.Multipart.PostDecorator;

    Post(options?: ApiOperation.Multipart.Post.Options): ApiOperation.Multipart.PostDecorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace ApiOperation {

    namespace Multipart {

      /**
       * @namespace Get
       */
      export namespace Get {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
        }
      }

      export type GetDecorator = ApiOperationDecorator & {};

      /**
       * @namespace Post
       */
      export namespace Post {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          maxFields?: number;
          maxFieldsSize?: number;
          maxFiles?: number;
          maxFileSize?: number;
          maxTotalFileSize?: number;
          minFileSize?: number;
        }
      }

      export type PostDecorator = ApiOperationDecorator & {};

    }

  }

}

/** Implementation **/

ApiOperation.Multipart = {} as any;

/**
 * ApiOperation.Multipart.Get
 */
ApiOperation.Multipart.Get = function (
    options?: ApiOperation.Multipart.Get.Options
): ApiOperation.Entity.CreateDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.CreateDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Multipart.Get';
  });
  return decorator;
}


/**
 * ApiOperation.Multipart.Post
 */
ApiOperation.Multipart.Post = function (
    options?: ApiOperation.Multipart.Post.Options
): ApiOperation.Entity.CreateDecorator {
  const decoratorChain: Function[] = [];
  const decorator = createOperationDecorator(decoratorChain, options) as ApiOperation.Entity.CreateDecorator;
  decoratorChain.push((operationMeta: ApiOperation.DecoratorMetadata) => {
    operationMeta.composition = 'Multipart.Post';
  });
  return decorator;
}
