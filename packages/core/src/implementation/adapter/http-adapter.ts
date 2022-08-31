import { OpraURL } from '@opra/url';
import { OpraVersion } from '../../constants.js';
import { HttpHeaders, HttpStatus } from '../../enums/index.js';
import {
  ApiException,
  BadRequestError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
} from '../../exception/index.js';
import { Headers, HeadersObject } from '../../helpers/headers.js';
import { ExecutionQuery, PropertyQuery } from '../../interfaces/execution-query.interface.js';
import { HttpAdapterContext } from '../../interfaces/http-context.interface.js';
import { ResourceContainer } from '../../interfaces/resource-container.interface.js';
import { KeyValue, QueryScope } from '../../types.js';
import { ComplexType } from '../data-type/complex-type.js';
import {
  ExecutionContext,
  ExecutionRequest,
  ExecutionResponse
} from '../execution-context.js';
import { ContainerResourceController } from '../resource/container-resource-controller.js';
import { EntityResourceController } from '../resource/entity-resource-controller.js';
import { OpraAdapter } from './adapter.js';

export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    prefix?: string;
  }
}

interface PreparedOutput {
  status: number;
  headers?: Record<string, string>;
  body?: any;
}

export class OpraHttpAdapter<TAdapterContext extends HttpAdapterContext,
    TOptions extends OpraHttpAdapter.Options = OpraHttpAdapter.Options> extends OpraAdapter<HttpAdapterContext, TOptions> {

  protected prepareExecutionContexts(adapterContext: TAdapterContext): ExecutionContext[] {
    const userContext = adapterContext.getUserContext();
    const req = adapterContext.getRequest();
    // todo implement batch requests
    if (this.isBatch(adapterContext)) {
      throw new Error('not implemented yet');
    }
    const url = new OpraURL(req.getUrl());
    return [this.prepareExecutionContext(url, req.getMethod(), Headers.from(req.getHeaders()), userContext)];
  }

  protected prepareExecutionContext(
      url: OpraURL,
      method: string,
      headers: HeadersObject,
      userContext?: any
  ): ExecutionContext {
    if (!url.path.size)
      throw new BadRequestError();
    if (method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();
    const query = this.buildQuery(url, method);
    const request = new ExecutionRequest({
      query,
      headers,
      params: url.searchParams,
    });
    const response = new ExecutionResponse();
    // noinspection UnnecessaryLocalVariableJS
    const executionContext = new ExecutionContext({
      service: this.service,
      request,
      response,
      userContext,
      continueOnError: request.query.operationType === 'read'
    })
    return executionContext;
  }

  protected buildQuery(url: OpraURL, method: string): ExecutionQuery {
    let container: ResourceContainer = this.service;
    try {
      let pathIndex = 0;
      const pathLen = url.path.size;
      while (pathIndex < pathLen) {
        let p = url.path.get(pathIndex++);
        const resource = container.getResource(p.resource);

        // Move through path directories (containers)
        if (resource instanceof ContainerResourceController) {
          container = resource;
        } else {
          method = method.toUpperCase();
          if (resource instanceof EntityResourceController) {
            const scope: QueryScope = p.key ? 'collection' : 'instance';

            if (pathIndex < pathLen && !(method === 'GET' && scope === 'instance'))
              throw new MethodNotAllowedError();

            let query: ExecutionQuery;
            switch (method) {
              case 'GET':
                if (scope === 'collection') {
                  query = ExecutionQuery.forSearch(resource, {
                    limit: url.searchParams.get('$limit'),
                    skip: url.searchParams.get('$skip'),
                    distinct: url.searchParams.get('$distinct'),
                    total: url.searchParams.get('$total'),
                    sort: url.searchParams.get('$sort'),
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                  });

                } else {
                  query = ExecutionQuery.forRead(resource, p.key as KeyValue, {
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit')
                  });

                  // Move through properties
                  let nested: PropertyQuery | undefined;
                  let path = resource.name;
                  while (pathIndex < pathLen) {
                    const dataType = nested
                        ? this.service.getDataType(nested.property.type || 'string')
                        : query.resource.dataType;
                    if (!(dataType instanceof ComplexType))
                      throw new Error(`"${path}" is not a ComplexType and has no properties.`);
                    p = url.path.get(pathIndex++);
                    path += '.' + p.resource;
                    const prop = dataType.properties?.[p.resource];
                    if (!prop)
                      throw new NotFoundError({message: `Invalid or unknown resource path (${path})`});
                    const q = ExecutionQuery.forProperty(prop);
                    if (nested) {
                      nested.nested = q;
                    } else {
                      query.nested = q;
                    }
                    nested = q;
                  }
                }
                break;
              case 'DELETE':
                if (scope === 'collection') {
                  query = ExecutionQuery.forDeleteMany(resource, {});
                } else {
                  query = ExecutionQuery.forDelete(resource, p.key as KeyValue);
                }
                break;
              default:
                throw new MethodNotAllowedError({
                  message: `Method "${method}" is not allowed by target resource`
                });
            }
            return query;
          }
        }
      }
      throw new InternalServerError();
    } catch (e: any) {
      if (e instanceof ApiException)
        throw e;
      throw new BadRequestError({message: e.message});
    }
  }

  protected async sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]) {

    const outputPackets: PreparedOutput[] = [];
    for (const ctx of executionContexts) {
      const v = this.createOutput(ctx);
      outputPackets.push(v);
    }

    if (this.isBatch(adapterContext)) {
      // this.writeError([], new InternalServerError({message: 'Not implemented yet'}));
      return;
    }

    if (!outputPackets.length) {
      const err = new NotFoundError()
      outputPackets.push({
            status: err.status,
            body: {
              errors: [err.response]
            }
          }
      )
    }

    const out = outputPackets[0];
    const resp = adapterContext.getResponse();

    resp.setStatus(out.status);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraVersion);
    if (out.headers) {
      for (const [k, v] of Object.entries(out.headers)) {
        resp.setHeader(k, v);
      }
    }
    resp.send(JSON.stringify(out.body));
  }

  protected isBatch(adapterContext): boolean {
    return false;
  }

  protected createOutput(ctx: ExecutionContext): PreparedOutput {
    const query = ctx.request.query;

    // Determine response status
    let status = ctx.response.status;
    if (ctx.response.errors.length) {
      if (!status || status < 400) {
        status = 0;
        for (const e of ctx.response.errors) {
          status = Math.max(status, e.status || status);
        }
        if (status < HttpStatus.BAD_REQUEST)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    } else
      status = status || (query.operationType === 'create' ? HttpStatus.CREATED : HttpStatus.OK);

    // Move to sub property if result path defined
    let value = ctx.response.value;
    if (ctx.request.resultPath) {
      const pathArray = ctx.request.resultPath.split('.');
      for (const property of pathArray) {
        value = value && typeof value === 'object' && value[property];
      }
    }

    const body: any = {
      // '@origin': ctx.resource.name + (ctx.request.resultPath ? '.' + ctx.request.resultPath : ''),
      value,
      total: Array.isArray(value) && ctx.response.total
    };
    if (ctx.response.errors.length)
      body.errors = ctx.response.errors.map(e => e.response);

    return {
      status,
      headers: ctx.response.headers,
      body
    }

  }


}
