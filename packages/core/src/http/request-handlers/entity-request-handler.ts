import bodyParser from 'body-parser';
import { toBoolean, toInt } from 'putil-varhelpers';
import * as valgen from 'valgen';
import {
  BadRequestError, Collection, Endpoint,
  HttpHeaderCodes, HttpStatusCodes,
  InternalServerError, MethodNotAllowedError, OpraException,
  ResourceNotFoundError, Singleton, translate,
} from '@opra/common';
import { EndpointContext } from '../../endpoint-context.js';
import { ExecutionContext } from '../../execution-context.js';
import { RequestHost } from '../../request.host.js';
import { Request } from '../../request.js';
import { parseArrayParam } from '../helpers/query-parsers.js';
import type { HttpAdapterBase } from '../http-adapter-base.js';
import { HttpServerRequest } from '../http-server-request.js';
import { RequestHandlerBase } from './request-handler-base.js';

type BodyLoaderFunction = (incoming: HttpServerRequest) => Promise<any>;

/**
 * @class EntityRequestHandler
 */
export class EntityRequestHandler extends RequestHandlerBase {
  readonly bodyLoaders = new WeakMap<Object, BodyLoaderFunction>();

  constructor(readonly adapter: HttpAdapterBase) {
    super(adapter);
  }

  async parseRequest(executionContext: ExecutionContext): Promise<Request | undefined> {
    const {incoming} = executionContext.switchToHttp();
    const p = incoming.parsedUrl.path[0];
    const resource = this.adapter.api.getResource(p.resource, true);
    if (!resource)
      throw new BadRequestError({
        message: translate('error:SOURCE_NOT_FOUND,', 'Resource not found'),
        code: 'SOURCE_NOT_FOUND',
        details: {
          path: incoming.parsedUrl.address
        }
      });
    try {
      if (resource instanceof Collection)
        return await this.parseCollectionRequest(resource, incoming);
      if (resource instanceof Singleton)
        return await this.parseSingletonRequest(resource, incoming);
    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      if (e instanceof valgen.ValidationError) {
        throw new BadRequestError({
          message: translate('error:REQUEST_VALIDATION,', 'Request validation failed'),
          code: 'REQUEST_VALIDATION',
          details: e.issues
        }, e);
      }
      throw new BadRequestError(e);
    }
  }

  async executeEndpoint(context: EndpointContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    const resource = request.resource as (Collection | Singleton);
    // Call endpoint handler method
    let value: any;
    try {
      value = await request.controller[request.operation].call(request.controller, context);
      if (value == null)
        value = response.value;

      const {operation} = request;
      if (operation === 'delete' || operation === 'deleteMany' || operation === 'updateMany') {
        let affected = 0;
        if (typeof value === 'number')
          affected = value;
        if (typeof value === 'boolean')
          affected = value ? 1 : 0;
        if (typeof value === 'object')
          affected = value.affected || value.affectedRows ||
              (operation === 'updateMany' ? value.updated : value.deleted);
        response.value = affected;
      } else {
        // "get" and "update" endpoints must return the entity instance, otherwise it means resource not found
        if (value == null && (request.operation === 'get' || request.operation === 'update'))
          throw new ResourceNotFoundError(resource.name, (request as RequestHost).key);
        // "findMany" endpoint should return array of entity instances
        if (request.operation === 'findMany')
          value = value == null ? [] : Array.isArray(value) ? value : [value];
        else value = value == null ? {} : Array.isArray(value) ? value[0] : value;
        response.value = value;
      }
    } catch (error) {
      response.errors.push(error);
    }
  }

  async sendResponse(context: EndpointContext): Promise<void> {
    const {request, response} = context;
    const resource = request.resource as (Collection | Singleton);
    const outgoing = response.switchToHttp();

    let responseObject: any;
    if (request.operation === 'delete' || request.operation === 'deleteMany') {
      responseObject = {
        resource: resource.name,
        operation: 'delete',
        affected: response.value
      }
    } else if (request.operation === 'updateMany') {
      responseObject = {
        resource: resource.name,
        operation: 'update',
        affected: response.value
      }
    } else {
      if (!response.value)
        throw new InternalServerError(`"${request.operation}" endpoint should return value`);
      const encode = resource.getEncoder(request.operation as any);
      const data = encode(response.value, {coerce: true});
      if (request.operation === 'create')
        outgoing.statusCode = 201;
      responseObject = {
        resource: resource.name,
        endpoint: request.operation,
        data
      }
      if (request.operation === 'create' || request.operation === 'update')
        responseObject.affected = 1;
      if (request.operation === 'findMany' && response.count != null && response.count >= 0)
        responseObject.totalCount = response.count;
    }

    outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
    const body = this.adapter._i18n.deep(responseObject);
    outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/opra+json; charset=utf-8');
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

  async parseCollectionRequest(resource: Collection, incoming: HttpServerRequest): Promise<Request> {
    if ((incoming.method === 'POST' || incoming.method === 'PATCH') && !incoming.is('json'))
      throw new BadRequestError({message: 'Unsupported Content-Type'});


    const contentId = incoming.headers['content-id'] as string;
    const p = incoming.parsedUrl.path[0];
    const params = incoming.parsedUrl.searchParams;
    switch (incoming.method) {
      case 'POST': {
        if (p.key == null) {
          const {controller, endpoint} = await this.getOperation(resource, 'create');
          const jsonReader = this.getBodyLoader(endpoint);
          const decode = resource.getDecoder('create');
          let data = await jsonReader(incoming);
          data = decode(data, {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            endpoint,
            operation: 'create',
            controller,
            http: incoming,
            contentId,
            data,
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpoint),
              pick: pick && resource.normalizeFieldPath(pick as string[]),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include)
            }
          });
        }
        break;
      }
      case 'DELETE': {
        if (p.key != null) {
          const {controller, endpoint} = await this.getOperation(resource, 'delete');
          return new RequestHost({
            endpoint,
            operation: 'delete',
            controller,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            params: this.parseParameters(incoming.parsedUrl, endpoint)
          });
        }
        const {controller, endpoint} = await this.getOperation(resource, 'deleteMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          endpoint,
          operation: 'deleteMany',
          controller,
          http: incoming,
          contentId,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            filter
          }
        });
      }

      case 'GET': {
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        if (p.key != null) {
          const {controller, endpoint} = await this.getOperation(resource, 'get');
          return new RequestHost({
            endpoint,
            operation: 'get',
            controller,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpoint),
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include)
            }
          });
        }
        const {controller, endpoint} = await this.getOperation(resource, 'findMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        const sort = parseArrayParam(params.get('$sort'));
        return new RequestHost({
          endpoint,
          operation: 'findMany',
          controller,
          http: incoming,
          contentId,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include),
            sort: sort && resource.normalizeSortFields(sort),
            filter,
            limit: toInt(params.get('$limit')),
            skip: toInt(params.get('$skip')),
            distinct: toBoolean(params.get('$distinct')),
            count: toBoolean(params.get('$count')),
          }
        });
      }

      case 'PATCH': {
        if (p.key != null) {
          const {controller, endpoint} = await this.getOperation(resource, 'update');
          const jsonReader = this.getBodyLoader(endpoint);
          const decode = resource.getDecoder('update');
          let data = await jsonReader(incoming);
          data = decode(data, {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            endpoint,
            operation: 'update',
            controller,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            data,
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpoint),
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include),
            }
          });
        }
        const {controller, endpoint} = await this.getOperation(resource, 'updateMany');
        const jsonReader = this.getBodyLoader(endpoint);
        const decode = resource.getDecoder('updateMany');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          endpoint,
          operation: 'updateMany',
          controller,
          http: incoming,
          contentId,
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            filter,
          }
        });
      }
    }
    throw new MethodNotAllowedError({
      message: `Collection resource do not accept http "${incoming.method}" method`
    });
  }

  async parseSingletonRequest(resource: Singleton, incoming: HttpServerRequest): Promise<Request> {
    if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
        incoming.headers['content-type'] !== 'application/json')
      throw new BadRequestError({message: 'Unsupported Content-Type'});
    const contentId = incoming.headers['content-id'] as string;

    const params = incoming.parsedUrl.searchParams;
    switch (incoming.method) {
      case 'POST': {
        const {controller, endpoint} = await this.getOperation(resource, 'create');
        const jsonReader = this.getBodyLoader(endpoint);
        const decode = resource.getDecoder('create');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          endpoint,
          operation: 'create',
          controller,
          http: incoming,
          contentId,
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      case 'DELETE': {
        const {controller, endpoint} = await this.getOperation(resource, 'delete');
        return new RequestHost({
          endpoint,
          operation: 'delete',
          controller,
          http: incoming,
          contentId,
          params: this.parseParameters(incoming.parsedUrl, endpoint)
        });
      }

      case 'GET': {
        const {controller, endpoint} = await this.getOperation(resource, 'get');
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          endpoint,
          operation: 'get',
          controller,
          http: incoming,
          contentId,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });

      }

      case 'PATCH': {
        const {controller, endpoint} = await this.getOperation(resource, 'update');
        const jsonReader = this.getBodyLoader(endpoint);
        const decode = resource.getDecoder('update');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          endpoint,
          operation: 'update',
          controller,
          http: incoming,
          contentId,
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpoint),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include),
          }
        });

      }
    }
    throw new MethodNotAllowedError({
      message: `Singleton resource do not accept http "${incoming.method}" method`
    });
  }

  protected getBodyLoader(endpoint: Endpoint): BodyLoaderFunction {
    let bodyLoader = this.bodyLoaders.get(endpoint);
    if (!bodyLoader) {
      const parser = bodyParser.json({
        limit: endpoint.input?.maxContentSize,
        type: 'json'
      });
      bodyLoader = (incoming: HttpServerRequest) => {
        return new Promise<any>((resolve, reject) => {
          const next = (error) => {
            if (error)
              return reject(error);
            resolve(incoming.body);
          }
          parser(incoming as any, {} as any, next)
        })
      }
      this.bodyLoaders.set(endpoint, bodyLoader);
    }
    return bodyLoader;
  }

}

