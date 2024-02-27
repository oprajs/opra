import { Type } from 'ts-gems';
import { MimeTypes } from '../../http/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiEndpointDecorator, createEndpointDecorator } from './api-endpoint.decorator.js';
import { ApiMediaContent } from './api-media-content.js';
import type { ApiOperation } from './api-operation.js';

export interface ApiOperationDecorator<T extends ApiOperationDecorator<any> = ApiOperationDecorator<any>> extends ApiEndpointDecorator<T> {
  RequestContent(type: string | Type): T;

  RequestContent(options: ApiMediaContent.DecoratorOptions): T;
}

export function createOperationDecorator<T extends ApiOperationDecorator<any>>(
    decoratorChain: Function[],
    options?: ApiOperation.DecoratorOptions & Pick<ApiOperation.DecoratorMetadata, 'composition' | 'compositionOptions'>
): T {
  const decorator = createEndpointDecorator(OpraSchema.Operation.Kind, decoratorChain, {
    method: 'GET',
    ...options
  }) as T;
  decorator.RequestContent = function (arg0: any) {
    const contentOpts: ApiMediaContent.DecoratorOptions = typeof arg0 === 'object' ? arg0 : {type: arg0};
    if (contentOpts.type) {
      contentOpts.contentType = contentOpts.contentType || MimeTypes.json;
      contentOpts.contentEncoding = contentOpts.contentEncoding || 'utf-8';
    }
    decoratorChain.push((operationMetadata: ApiOperation.DecoratorMetadata) => {
      operationMetadata.requestBody = operationMetadata.requestBody || {} as any;
      operationMetadata.requestBody!.content = operationMetadata.requestBody!.content || [];
      operationMetadata.requestBody!.content.push(contentOpts);
    })
    return decorator;
  }
  return decorator;
}
