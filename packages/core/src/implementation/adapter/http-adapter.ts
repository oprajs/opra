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
import { HttpAdapterContext } from '../../interfaces/http-context.interface.js';
import { OperationMethod } from '../../types.js';
import { ComplexType } from '../data-type/complex-type.js';
import {
  ExecutionContext,
  ExecutionRequest,
  ExecutionResponse
} from '../execution-context.js';
import { ExecutionQuery } from '../execution-query.js';
import { EntityResource } from '../resource/entity-resource.js';
import { Resource } from '../resource/resource.js';
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
    const {query, resource, resultPath} = this.buildQuery(url, method);
    const request = new ExecutionRequest({
      headers,
      params: url.searchParams,
      query,
      resultPath,
    });
    const response = new ExecutionResponse();
    // noinspection UnnecessaryLocalVariableJS
    const executionContext = new ExecutionContext({
      service: this.service,
      resource,
      request,
      response,
      userContext,
      continueOnError: request.query.operationMethod === 'read'
    })
    return executionContext;
  }

  protected buildQuery(url: OpraURL, method: string): {
    query: ExecutionQuery;
    resource: Resource,
    resultPath: string
  } {
    method = method.toUpperCase();
    const rootPath = url.path.get(0);
    const resource = this.service.resources[rootPath.resource];
    if (!resource)
      throw new NotFoundError({
        message: `Resource "${rootPath.resource}" not found`
      });
    if (resource instanceof EntityResource) {
      if (!rootPath.key && url.path.size > 1)
        throw new BadRequestError({message: `You can't request collection of sub-properties`});
      if (method !== 'GET' && url.path.size > 1)
        throw new BadRequestError({message: `You can't send update/delete request for for sub-properties`});
      if (rootPath.key && !resource.primaryKey)
        throw new BadRequestError({message: `Primary key is not assigned for resource "${resource.name}"`});

      let operationMethod: OperationMethod;
      switch (method) {
        case 'GET':
          operationMethod = 'read';
          break;
        case 'DELETE':
          operationMethod = 'delete';
          break;
        case 'POST':
          operationMethod = 'create';
          break;
        case 'PUT':
          operationMethod = 'update';
          break;
        case 'PATCH':
          operationMethod = 'patch';
          break;
        default:
          throw new MethodNotAllowedError({
            message: `Method "${method}" is not allowed by target resource`
          });
      }

      try {
        let node: any = rootPath.key
            ? ExecutionQuery.createForInstance(this.service, operationMethod, rootPath.resource, rootPath.key)
            : ExecutionQuery.createForCollection(this.service, operationMethod, rootPath.resource);

        const resultPath: string[] = [];
        for (let i = 1; i < url.path.size - 1; i++) {
          if (!(node instanceof ExecutionQuery))
            throw new TypeError(`"${resultPath.join('.')}" is not a ComplexType and have no properties`);
          const p = url.path.get(i);
          node = node.addProperty(p.resource);
          if (node instanceof ExecutionQuery)
            resultPath.push(node.path);
          else resultPath.push(node);
        }

        if (node.dataType instanceof ComplexType) {
          node.setProjection(
              url.searchParams.get('$elements'),
              url.searchParams.get('$exclude'),
              url.searchParams.get('$include'));
          if (node.operationType === 'search') {
            // node.filter = url.searchParams.get('$filter');
            node.setLimit(url.searchParams.get('$limit'));
            node.setSkip(url.searchParams.get('$skip'));
            node.setDistinct(url.searchParams.get('$distinct'));
            node.setTotal(url.searchParams.get('$total'));
            node.setSort(url.searchParams.get('$sort'));
          }
        }

        return {
          query: node,
          resource,
          resultPath: resultPath.join('.')
        };

      } catch (e: any) {
        if (e instanceof ApiException)
          throw e;
        throw new BadRequestError({message: e.message});
      }

    }
    throw new InternalServerError();
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
      status = status || (query.operationMethod === 'create' ? HttpStatus.CREATED : HttpStatus.OK);

    // Move to sub property if result path defined
    let value = ctx.response.value;
    if (ctx.request.resultPath) {
      const pathArray = ctx.request.resultPath.split('.');
      for (const property of pathArray) {
        value = value && typeof value === 'object' && value[property];
      }
    }

    const body: any = {
      '@origin': ctx.resource.name + (ctx.request.resultPath ? '.' + ctx.request.resultPath : ''),
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
