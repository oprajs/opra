import { HttpStatusCode, MimeTypes } from '../../enums/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import { FieldPathType } from '../data-type/extended-types/index.js';
import { HttpOperation } from '../http/http-operation.js';
import { HttpOperationDecoratorFactory } from './http-operation.decorator.js';
import {
  createKeyParamDecorator,
  getDataTypeName,
} from './http-operation-entity.decorator.js';

/**
 * HttpOperation.Entity.Replace
 */
HttpOperation.Entity.Replace = function (
  arg0: any,
  arg1?: any,
): HttpOperation.Entity.ReplaceDecorator {
  let args: HttpOperation.Entity.GetArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const decorator = HttpOperationDecoratorFactory(decoratorChain, {
    method: 'POST',
    ...args,
    composition: 'Entity.Replace',
  }) as HttpOperation.Entity.ReplaceDecorator;
  decorator
    .QueryParam('projection', {
      description: 'Determines fields projection',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'each',
      }),
      isArray: true,
      arraySeparator: ',',
    })
    .Response(HttpStatusCode.OK, {
      description:
        'Operation is successful. Returns OperationResult with "payload" field that contains the resource asked for.',
      contentType: MimeTypes.opra_response_json,
      type: args.type,
      partial: 'deep',
    })
    .Response(HttpStatusCode.NO_CONTENT, {
      description: 'Operation is successful but no resource found',
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
