import { ForbiddenError, OpraSchema, Source, translate } from '@opra/common';
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


  async assertEndpoint<T extends OpraSchema.Endpoint = OpraSchema.Endpoint>(
      source: Source, endpoint: string
  ): Promise<T & {
    controller: any;
  }> {
    const controller = await this.adapter.getController(source);
    const endpointMeta = (typeof controller?.[endpoint] === 'function') && source.endpoints[endpoint];
    if (endpointMeta)
      return {
        ...endpointMeta,
        controller
      };
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {resource: source.name, endpoint},
          `'{{resource}}' endpoint does not accept '{{endpoint}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });

  }

}
