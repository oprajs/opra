import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
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

      export type GetDecorator = ApiOperationDecorator<GetDecorator> & {};

      /**
       * @namespace Post
       */
      export namespace Post {
        export interface Options extends StrictOmit<ApiOperation.DecoratorOptions, 'method'> {
          contentType?: string;
          maxFields?: number;
          maxFieldsSize?: number;
          maxFiles?: number;
          maxFileSize?: number;
          maxTotalFileSize?: number;
          minFileSize?: number;
        }
      }

      export type PostDecorator = ApiOperationDecorator<PostDecorator> & {};

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
): ApiOperation.Multipart.GetDecorator {
  const decoratorChain: Function[] = [];
  return createOperationDecorator<ApiOperation.Multipart.GetDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Multipart.Get'
  }));
}


/**
 * ApiOperation.Multipart.Post
 */
ApiOperation.Multipart.Post = function (
    options?: ApiOperation.Multipart.Post.Options
): ApiOperation.Multipart.PostDecorator {
  const decoratorChain: Function[] = [];
  return createOperationDecorator<ApiOperation.Multipart.PostDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'POST',
    composition: 'Multipart.Post',
    compositionOptions: omitUndefined({
      ...options,
      description: undefined
    })
  })).RequestContent({
    contentType: options?.contentType || 'multipart/form-data'
  });
}
