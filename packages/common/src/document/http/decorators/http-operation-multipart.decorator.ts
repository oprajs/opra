import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../../helpers/index.js';
import { HttpOperation } from '../http-operation.js';
import { createHttpOperationDecorator, HttpOperationDecorator } from './http-operation.decorator.js';

/** Augmentation **/
declare module '../http-operation' {

  /**
   * HttpOperationConstructor
   */
  interface HttpOperationConstructor {
    Multipart: HttpOperationMultipart;
  }

  interface HttpOperationMultipart {
    GET(options?: HttpOperation.Multipart.GetOptions): HttpOperation.Multipart.PostDecorator;

    PATCH(options?: HttpOperation.Multipart.PatchOptions): HttpOperation.Multipart.PatchDecorator;

    POST(options?: HttpOperation.Multipart.PostOptions): HttpOperation.Multipart.PostDecorator;

    PUT(options?: HttpOperation.Multipart.PostOptions): HttpOperation.Multipart.PostDecorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace HttpOperation {

    namespace Multipart {

      /**
       * GetDecorator
       */
      export type GetDecorator = HttpOperationDecorator<GetDecorator> & {};

      /**
       * @interface GetOptions
       */
      export interface GetOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
      }


      /**
       * PostDecorator
       */
      export type PostDecorator = HttpOperationDecorator<PostDecorator> & {};

      /**
       * @interface Post
       */
      export interface PostOptions extends StrictOmit<HttpOperation.DecoratorOptions, 'method'> {
        contentType?: string;
        maxFields?: number;
        maxFieldsSize?: number;
        maxFiles?: number;
        maxFileSize?: number;
        maxTotalFileSize?: number;
        minFileSize?: number;
      }

      /**
       * PatchDecorator
       */
      export type PatchDecorator = PostDecorator;
      export type PatchOptions = PostOptions;

      /**
       * PutDecorator
       */
      export type PutDecorator = PostDecorator;
      export type PutOptions = PostOptions;

    }

  }

}

/** Implementation **/

HttpOperation.Multipart = {} as any;

/**
 * HttpOperation.Multipart.GET
 */
HttpOperation.Multipart.GET = function (
    options?: HttpOperation.Multipart.GetOptions
): HttpOperation.Multipart.GetDecorator {
  const decoratorChain: Function[] = [];
  return createHttpOperationDecorator<HttpOperation.Multipart.GetDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'GET',
    composition: 'Multipart.GET'
  }));
}

/**
 * HttpOperation.Multipart.POST
 */
HttpOperation.Multipart.POST = function (
    options?: HttpOperation.Multipart.PostOptions
): HttpOperation.Multipart.PostDecorator {
  const decoratorChain: Function[] = [];
  return createHttpOperationDecorator<HttpOperation.Multipart.PostDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'POST',
    composition: 'Multipart.POST',
    compositionOptions: omitUndefined({
      ...options,
      description: undefined
    })
  })).RequestContent({
    contentType: options?.contentType || 'multipart/form-data'
  });
}

/**
 * HttpOperation.Multipart.PATCH
 */
HttpOperation.Multipart.PATCH = function (
    options?: HttpOperation.Multipart.PatchOptions
): HttpOperation.Multipart.PatchDecorator {
  const decoratorChain: Function[] = [];
  return createHttpOperationDecorator<HttpOperation.Multipart.PostDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'PATCH',
    composition: 'Multipart.PATCH',
    compositionOptions: omitUndefined({
      ...options,
      description: undefined
    })
  })).RequestContent({
    contentType: options?.contentType || 'multipart/form-data'
  });
}


/**
 * HttpOperation.Multipart.Post
 */
HttpOperation.Multipart.PUT = function (
    options?: HttpOperation.Multipart.PutOptions
): HttpOperation.Multipart.PutDecorator {
  const decoratorChain: Function[] = [];
  return createHttpOperationDecorator<HttpOperation.Multipart.PostDecorator>(decoratorChain, omitUndefined({
    description: options?.description,
    method: 'PUT',
    composition: 'Multipart.PUT',
    compositionOptions: omitUndefined({
      ...options,
      description: undefined
    })
  })).RequestContent({
    contentType: options?.contentType || 'multipart/form-data'
  });
}
