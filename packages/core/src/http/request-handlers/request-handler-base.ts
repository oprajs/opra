import { ForbiddenError, OpraSchema, OpraURL, Resource, translate } from '@opra/common';
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


  async assertEndpoint<T extends OpraSchema.Endpoint = OpraSchema.Endpoint>(
      resource: Resource, endpoint: string
  ): Promise<T & {
    controller: any;
  }> {
    const controller = await this.adapter.getController(resource);
    const endpointMeta = (typeof controller?.[endpoint] === 'function') && resource.operations[endpoint];
    if (endpointMeta)
      return {
        ...endpointMeta,
        controller
      };
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {resource: resource.name, endpoint},
          `'{{resource}}' endpoint does not accept '{{endpoint}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });
  }

  protected parseParameters(parsedUrl: OpraURL, metadata: OpraSchema.Endpoint): any {
    if (!metadata.parameters)
      return;
    const searchParams = parsedUrl.searchParams;
    const out = {};
    for (const [k] of Object.entries(metadata.parameters)) {
      out[k] = searchParams.get(k);
    }
    return out;
  }


}
