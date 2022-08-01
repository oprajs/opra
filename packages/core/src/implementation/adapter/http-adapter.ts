import util from 'util';
import { OpraURL } from '@opra/url';
import { HttpStatus } from '../../enums';
import { ApiException, BadRequestError, NotFoundError } from '../../exceptions';
import { InternalServerError } from '../../exceptions/errors/internal-server.error.js';
import { HttpRequest, HttpResponse } from '../../interfaces/adapter';
import { ExecutionContext } from '../../interfaces/execution-context.interface';
import { OperationKind } from '../../types';
import { ComplexType } from '../data-type/complex-type';
import { ExecutionContextHost } from '../execution-context';
import { ExecutionQueryHost } from '../execution-query';
import { EntityResource } from '../resource/entity-resource.js';
import { OpraAdapter } from './adapter.js';

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
    query: ExecutionQueryHost;
    returnPath: string;
  } {
    const rootPath = url.path.get(0);
    const rootResource = this.service.resources[rootPath.resource];
    if (!rootResource)
      throw new NotFoundError({
        message: `Resource "${rootPath.resource}" not found`
      });
    if (rootResource instanceof EntityResource) {
      if (!rootPath.key && url.path.size > 1)
        throw new BadRequestError({message: `Invalid URL`});

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
      const root = new ExecutionQueryHost({
        service: this.service,
        operation,
        resource: rootPath.resource,
        key: rootPath.key,
        path: '',
        resultType: rootResource.dataType,
      });

      if (rootResource.primaryKey) {
        root.elements = root.elements || {};
        (Array.isArray(rootResource.primaryKey) ? rootResource.primaryKey : [rootResource.primaryKey])
            .forEach(k => {
              // eslint-disable-next-line
              root.elements![k] = false
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
        const subNode = new ExecutionQueryHost({
          service: this.service,
          operation: root.operation,
          resource: p.resource,
          key: prop.name,
          resultType: this.service.getDataType(prop.type || 'string'),
          path: fullPath
        });
        node.elements = node.elements || {};
        node.elements[prop.name] = subNode;
        node = subNode;
        returnPath += (returnPath ? '.' : '') + prop.name;
      }

      if (node.resultType instanceof ComplexType) {
        const exposedList = url.searchParams.get('_elements') ||
            (node.resultType.properties && Object.keys(node.resultType.properties));
        if (exposedList) {
          const elements = node.elements || {};
          for (const elName of exposedList) {
            const el = elements[elName];
            if (el != null) {
              if (typeof el === 'object') {
                (el as ExecutionQueryHost).expose = true;
              } else elements[elName] = true;
              continue;
            }
            const prop = node.resultType.properties?.[elName];
            if (prop)
              elements[prop.name] = true;
          }
          node.elements = elements;
        }
      }

      // eslint-disable-next-line
      console.log(util.inspect(root, {depth: 10, colors: true}));

      return {
        query: root,
        returnPath
      };
    }
    throw new InternalServerError();

  }

}
