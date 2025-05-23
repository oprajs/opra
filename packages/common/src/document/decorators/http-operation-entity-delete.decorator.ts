import { HttpStatusCode, MimeTypes } from '../../enums/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import { HttpOperation } from '../http/http-operation.js';
import { HttpOperationDecoratorFactory } from './http-operation.decorator.js';
import {
  createKeyParamDecorator,
  getDataTypeName,
} from './http-operation-entity.decorator.js';

/**
 * HttpOperation.Entity.Delete
 */
HttpOperation.Entity.Delete = function (
  arg0: any,
  arg1?: any,
): HttpOperation.Entity.DeleteDecorator {
  let args: HttpOperation.Entity.DeleteArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const decorator = HttpOperationDecoratorFactory(decoratorChain, {
    method: 'DELETE',
    ...args,
    composition: 'Entity.Delete',
  }) as HttpOperation.Entity.DeleteDecorator;
  decorator
    .Response(HttpStatusCode.OK, {
      description:
        'Operation is successful. Returns OperationResult with "affected" field.',
      contentType: MimeTypes.opra_response_json,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description:
        'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions =
      operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
  });

  decorator.KeyParam = createKeyParamDecorator(decorator, decoratorChain);

  return decorator;
};
