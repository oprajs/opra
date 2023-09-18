import * as valgen from 'valgen';
import {
  Endpoint,
  ForbiddenError,
  InternalServerError,
  OpraException,
  OpraURL,
  Resource,
  translate
} from '@opra/common';
import { EndpointContext } from '../../endpoint-context.js';
import type { ExecutionContext } from '../../execution-context.js';
import type { RequestHandler } from '../../interfaces/request-handler.interface.js';
import { RequestHost } from '../../request.host';
import type { Request } from '../../request.js';
import { ResponseHost } from '../../response.host.js';
import type { Response } from '../../response.js';
import type { HttpAdapterBase } from '../http-adapter-base.js';

/**
 * @class RequestHandlerBase
 */
export abstract class RequestHandlerBase implements RequestHandler {

  protected constructor(readonly adapter: HttpAdapterBase) {
  }

  abstract sendResponse(context: EndpointContext): Promise<void>;

  async handle(executionContext: ExecutionContext): Promise<void> {
    const {outgoing} = executionContext.switchToHttp();
    // Parse incoming message and create Request object
    const request = await this.parseRequest(executionContext);
    if (!request) return;
    const response: Response = new ResponseHost({http: outgoing});
    const context = EndpointContext.from(executionContext, request, response);
    await this.executeEndpoint(context);
    if (response.errors.length) {
      context.errors.push(...response.errors);
      return;
    }
    try {
      await this.sendResponse(context);
    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      if (e instanceof valgen.ValidationError) {
        throw new InternalServerError({
          message: translate('error:RESPONSE_VALIDATION,', 'Response validation failed'),
          code: 'RESPONSE_VALIDATION',
          details: e.issues
        }, e);
      }
      throw new InternalServerError(e);
    }
  }

  async parseRequest(executionContext: ExecutionContext): Promise<Request | undefined> {
    return;
  }


  async executeEndpoint(context: EndpointContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    // Call endpoint handler method
    let value: any;
    try {
      value = await request.controller[request.operation].call(request.controller, context);
      if (response.value == null)
        response.value = value;
    } catch (error) {
      response.errors.push(error);
    }
  }

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
      const fn = typeof controller[operation] === 'function' ? controller[operation] : undefined;
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
