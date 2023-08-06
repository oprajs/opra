import { ForbiddenError, OpraSchema, Resource, translate } from '@opra/common';
import type { ExecutionContext } from '../../execution-context';
import type { RequestHandler } from '../../interfaces/request-handler.interface';
import type { HttpAdapterBase } from '../http-adapter-base';


/**
 * @class RequestHandlerBase
 */
export abstract class RequestHandlerBase implements RequestHandler {

  protected constructor(readonly adapter: HttpAdapterBase) {
  }

  abstract processRequest(executionContext: ExecutionContext): Promise<void>;


  async assertOperation<T extends OpraSchema.Operation = OpraSchema.Operation>(
      resource: Resource, operation: string
  ): Promise<T & {
    controller: any;
  }> {
    const controller = await this.adapter.getController(resource);
    const operationMeta = (typeof controller?.[operation] === 'function') && resource.operations[operation];
    if (operationMeta)
      return {
        ...operationMeta,
        controller
      };
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {resource: resource.name, operation},
          `'{{resource}}' endpoint does not accept '{{operation}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });

  }

}
