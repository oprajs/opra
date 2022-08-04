import { OpraURL } from '@opra/url';
import { HttpStatus } from '../../enums';
import { ApiException, BadRequestError, NotFoundError } from '../../exceptions';
import { InternalServerError } from '../../exceptions/errors/internal-server.error.js';
import { HttpRequest, HttpResponse } from '../../interfaces/adapter';
import { ExecutionContext } from '../../interfaces/execution-context.interface';
import { OperationKind } from '../../types';
import { ComplexType } from '../data-type/complex-type';
import { ExecutionContextHost } from '../execution-context';
import { ExecutionQuery } from '../execution-query';
import { EntityResource } from '../resource/entity-resource.js';
import { OpraAdapter } from './adapter.js';
import { generateProjection } from './utils/generate-projection';

export interface HttpAdapterContext {
  request: HttpRequest;
  response: HttpResponse;
}

export class OpraHttpAdapter<TAdapterContext extends HttpAdapterContext> extends OpraAdapter<HttpAdapterContext> {

  protected async sendResponse(adapterContext: TAdapterContext, executionContext: ExecutionContext) {
    const {query, response, errors} = executionContext;
    let status = response.status;

    if (!status) {
      status = query.operation === 'create' ? HttpStatus.CREATED : HttpStatus.OK;
      if (errors) {
        for (const e of errors as ApiException[]) {
          status = Math.max(status, e.status || status);
        }
        if (status < HttpStatus.BAD_REQUEST)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    if (response.headers) {
      for (const [k, v] of Object.entries(response.headers)) {
        // adapterContext.response.setHeader(k, v);
      }
    }

    const body = {
      // '@resource': request.resourceName,
      value: response.value,
      etag: response.etag,
      total: response.etag,
      errors
    };
    // Object.assign(body, _.omit(response.additional, Object.keys(body)));

    adapterContext.response.setStatus(status)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(body));
  }

  protected buildExecutionContext(adapterContext: TAdapterContext): ExecutionContext {
    const req = adapterContext.request;
    const url = new OpraURL(req.url);
    if (!url.path.size)
      throw new BadRequestError();
    if (req.method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();

    const {query, returnPath} = this.buildQuery(url, req.method);
    const out = new ExecutionContextHost({
      service: this.service,
      query,
      returnPath,
      response: {}
    });

    return out;
  }

  protected buildQuery(url: OpraURL, method: string): {
    query: ExecutionQuery;
    returnPath: string;
  } {
    method = method.toUpperCase();
    const rootPath = url.path.get(0);
    const rootResource = this.service.resources[rootPath.resource];
    if (!rootResource)
      throw new NotFoundError({
        message: `Resource "${rootPath.resource}" not found`
      });
    if (rootResource instanceof EntityResource) {
      if (!rootPath.key && url.path.size > 1)
        throw new BadRequestError({message: `You can't request collection of sub-properties`});
      if (method !== 'GET' && url.path.size > 1)
        throw new BadRequestError({message: `You can't send update/delete request for for sub-properties`});
      if (rootPath.key && !rootResource.primaryKey)
        throw new BadRequestError({message: `Primary key is not assigned for resource "${rootResource.name}"`});

      let operation: OperationKind;
      switch (method) {
        case 'GET':
          operation = 'read';
          break;
        case 'DELETE':
          operation = 'delete';
          break;
        case 'POST':
          operation = 'create';
          break;
        case 'PUT':
          operation = 'update';
          break;
        case 'PATCH':
          operation = 'patch';
          break;
        default:
          throw new BadRequestError({
            message: `Invalid http method (${method})`
          });
      }

      let fullPath = '';
      const root = new ExecutionQuery({
        service: this.service,
        operation,
        resource: rootResource,
        keyValues: undefined,
        collection: !rootPath.key,
        path: '',
        fullPath,
        resultType: rootResource.dataType,
      });

      if (rootPath.key) {
        root.keyValues = {};
        root.projection = root.projection || {};

        (Array.isArray(rootResource.primaryKey) ? rootResource.primaryKey : [rootResource.primaryKey])
            .forEach((k, i) => {
              if (typeof rootPath.key === 'object') {
                root.keyValues[k] = rootPath.key[k];
              } else if (i === 0)
                root.keyValues[k] = rootPath.key;
              else throw new BadRequestError({
                  message: `You must provide all primary key values (${rootResource.primaryKey})`
                });
              // eslint-disable-next-line
              root.projection![k] = false
            });
      }

      let node = root;
      let returnPath = '';
      for (let i = 1; i < url.path.size - 1; i++) {
        const p = url.path.get(i);
        if (!(node.resultType instanceof ComplexType))
          throw new NotFoundError({
            message: `"${p.resource}" is not a ComplexType and has no properties.`
          });
        const prop = node.resultType.properties?.[p.resource];
        if (!prop)
          throw new NotFoundError({
            message: `"${node.resultType.name}" has no property named "${p.resource}".`
          });
        fullPath += (fullPath ? '.' : '') + prop.name;
        const subNode = new ExecutionQuery({
          service: this.service,
          resource: rootResource,
          operation: root.operation,
          collection: !!prop.isArray,
          resultType: this.service.getDataType(prop.type || 'string'),
          path: prop.name,
          fullPath
        });
        node.nodes = node.nodes || {};
        node.nodes[prop.name] = subNode;
        node = subNode;
        returnPath += (returnPath ? '.' : '') + prop.name;
      }

      if (node.resultType instanceof ComplexType) {
        generateProjection(
            node,
            url.searchParams.get('$elements'),
            url.searchParams.get('$exclude'),
            url.searchParams.get('$include'));
        node.filter = url.searchParams.get('$filter');
        node.limit = url.searchParams.get('$limit');
        node.skip = url.searchParams.get('$skip');
        node.sort = url.searchParams.get('$sort');
        node.distinct = url.searchParams.get('$distinct');
        node.total = url.searchParams.get('$total');
      }

      return {
        query: root,
        returnPath
      };
    }
    throw new InternalServerError();

  }

}
