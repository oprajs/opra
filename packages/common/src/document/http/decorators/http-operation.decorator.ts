import { Type } from 'ts-gems';
import { MimeTypes } from '../../../http/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { HttpMediaContent } from '../http-media-content.js';
import type { HttpOperation } from '../http-operation';
import { createHttpEndpointDecorator, HttpEndpointDecorator } from './http-endpoint.decorator.js';


export interface HttpOperationDecorator<T extends HttpOperationDecorator<any> = HttpOperationDecorator<any>> extends HttpEndpointDecorator<T> {
  RequestContent(type: string | Type): T;

  RequestContent(options: HttpMediaContent.DecoratorOptions): T;
}

export function createHttpOperationDecorator<T extends HttpOperationDecorator<any>>(
    decoratorChain: Function[],
    options?: HttpOperation.DecoratorOptions & Pick<HttpOperation.DecoratorMetadata, 'composition' | 'compositionOptions'>
): T {
  const decorator = createHttpEndpointDecorator(OpraSchema.Http.Operation.Kind, decoratorChain, {
    method: 'GET',
    ...options
  }) as T;
  decorator.RequestContent = function (arg0: any) {
    const contentOpts: HttpMediaContent.DecoratorOptions = typeof arg0 === 'object' ? arg0 : {type: arg0};
    if (contentOpts.type) {
      contentOpts.contentType = contentOpts.contentType || MimeTypes.json;
      contentOpts.contentEncoding = contentOpts.contentEncoding || 'utf-8';
    }
    decoratorChain.push((operationMetadata: HttpOperation.DecoratorMetadata) => {
      operationMetadata.requestBody = operationMetadata.requestBody || {} as any;
      operationMetadata.requestBody!.content = operationMetadata.requestBody!.content || [];
      operationMetadata.requestBody!.content.push(contentOpts);
    })
    return decorator;
  }
  return decorator;
}
