import { Endpoint, ForbiddenError, OpraURL, Resource, translate } from '@opra/common';
import type { ExecutionContext } from '../../execution-context.js';
import type { RequestHandler } from '../../interfaces/request-handler.interface.js';
import type { HttpAdapterBase } from '../http-adapter-base.js';

/**
 * @class RequestHandlerBase
 */
export abstract class RequestHandlerBase implements RequestHandler {

  protected constructor(readonly adapter: HttpAdapterBase) {
  }

  abstract processRequest(executionContext: ExecutionContext): Promise<void>;


  protected parseParameters(parsedUrl: OpraURL, endpoint: Endpoint): any {
    if (!endpoint.parameters.size)
      return;
    const searchParams = parsedUrl.searchParams;
    const out = {};
    for (const k of endpoint.parameters.keys()) {
      out[k] = searchParams.get(k);
    }
    return out;
  }

  protected async getOperation(
      resource: Resource,
      operation: string
  ): Promise<{
    endpoint: Endpoint;
    controller: any;
    fn: Function;
  }> {
    const controller = await this.adapter.getController(resource);
    const endpoint = resource.getOperation(operation);
    if (endpoint) {
      const fn = typeof controller[operation] === 'function' ? controller[operation]: undefined;
      if (fn)
        return {controller, endpoint, fn};
    }
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {resource: resource.name, endpoint: operation},
          `'{{resource}}' endpoint does not accept '{{endpoint}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });
  }

}
