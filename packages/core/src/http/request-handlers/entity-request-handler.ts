import bodyParser from 'body-parser';
import { toBoolean, toInt } from 'putil-varhelpers';
import * as valgen from 'valgen';
import {
  BadRequestError, Collection, HttpHeaderCodes, HttpStatusCodes,
  InternalServerError, MethodNotAllowedError, OpraException,
  OpraSchema, ResourceNotFoundError, Singleton, translate,
} from '@opra/common';
import { EndpointContext } from '../../endpoint-context.js';
import { ExecutionContext } from '../../execution-context.js';
import { RequestHost } from '../../request.host.js';
import { Request } from '../../request.js';
import { ResponseHost } from '../../response.host.js';
import { Response } from '../../response.js';
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

  async processRequest(executionContext: ExecutionContext): Promise<void> {
    const {incoming, outgoing} = executionContext.switchToHttp();
    // Parse incoming message and create Request object
    const request = await this.parseRequest(incoming);
    if (!request) return;
    const response: Response = new ResponseHost({http: outgoing});
    const context = EndpointContext.from(executionContext, request, response);
    await this.callEndpoint(context);
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

  async parseRequest(incoming: HttpServerRequest): Promise<Request | undefined> {
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

  async callEndpoint(context: EndpointContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    const resource = request.resource as (Collection | Singleton);
    // Call endpoint handler method
    let value: any;
    try {
      value = await request.controller[request.endpoint].call(request.controller, context);
      if (value == null)
        value = response.value;

      const {endpoint} = request;
      if (endpoint === 'delete' || endpoint === 'deleteMany' || endpoint === 'updateMany') {
        let affected = 0;
        if (typeof value === 'number')
          affected = value;
        if (typeof value === 'boolean')
          affected = value ? 1 : 0;
        if (typeof value === 'object')
          affected = value.affected || value.affectedRows ||
              (endpoint === 'updateMany' ? value.updated : value.deleted);
        response.value = affected;
      } else {
        // "get" and "update" endpoints must return the entity instance, otherwise it means resource not found
        if (value == null && (request.endpoint === 'get' || request.endpoint === 'update'))
          throw new ResourceNotFoundError(resource.name, (request as RequestHost).key);
        // "findMany" endpoint should return array of entity instances
        if (request.endpoint === 'findMany')
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
    if (request.endpoint === 'delete' || request.endpoint === 'deleteMany') {
      responseObject = {
        resource: resource.name,
        operation: 'delete',
        affected: response.value
      }
    } else if (request.endpoint === 'updateMany') {
      responseObject = {
        resource: resource.name,
        operation: 'update',
        affected: response.value
      }
    } else {
      if (!response.value)
        throw new InternalServerError(`"${request.endpoint}" endpoint should return value`);
      const encode = resource.getEncoder(request.endpoint as any);
      const data = encode(response.value, {coerce: true});
      if (request.endpoint === 'create')
        outgoing.statusCode = 201;
      responseObject = {
        resource: resource.name,
        endpoint: request.endpoint,
        data
      }
      if (request.endpoint === 'create' || request.endpoint === 'update')
        responseObject.affected = 1;
      if (request.endpoint === 'findMany' && response.count != null && response.count >= 0)
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
          const endpointMeta =
              await this.assertEndpoint<OpraSchema.Collection.CreateEndpoint>(resource, 'create');
          const jsonReader = this.getBodyLoader(endpointMeta);
          const decode = resource.getDecoder('create');
          let data = await jsonReader(incoming);
          data = decode(data, {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            contentId,
            resource,
            endpoint: 'create',
            data,
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpointMeta),
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
          const endpointMeta =
              await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'delete');
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            contentId,
            resource,
            endpoint: 'delete',
            key: resource.parseKeyValue(p.key),
            params: this.parseParameters(incoming.parsedUrl, endpointMeta)
          });
        }
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'deleteMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'deleteMany',
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
            filter
          }
        });
      }

      case 'GET': {
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        if (p.key != null) {
          const endpointMeta =
              await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'get');
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            contentId,
            resource,
            endpoint: 'get',
            key: resource.parseKeyValue(p.key),
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpointMeta),
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include)
            }
          });
        }
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'findMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        const sort = parseArrayParam(params.get('$sort'));
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'findMany',
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
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
          const endpointMeta =
              await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'update');
          const jsonReader = this.getBodyLoader(endpointMeta);
          const decode = resource.getDecoder('update');
          let data = await jsonReader(incoming);
          data = decode(data, {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            contentId,
            resource,
            endpoint: 'update',
            key: resource.parseKeyValue(p.key),
            data,
            params: {
              ...this.parseParameters(incoming.parsedUrl, endpointMeta),
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include),
            }
          });
        }
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Collection.DeleteEndpoint>(resource, 'updateMany');
        const jsonReader = this.getBodyLoader(endpointMeta);
        const decode = resource.getDecoder('updateMany');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'updateMany',
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
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
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Singleton.DeleteEndpoint>(resource, 'create');
        const jsonReader = this.getBodyLoader(endpointMeta);
        const decode = resource.getDecoder('create');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'create',
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      case 'DELETE': {
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Singleton.DeleteEndpoint>(resource, 'delete');
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'delete',
          params: this.parseParameters(incoming.parsedUrl, endpointMeta)
        });
      }

      case 'GET': {
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Singleton.DeleteEndpoint>(resource, 'get');
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'get',
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });

      }

      case 'PATCH': {
        const endpointMeta =
            await this.assertEndpoint<OpraSchema.Singleton.DeleteEndpoint>(resource, 'update');
        const jsonReader = this.getBodyLoader(endpointMeta);
        const decode = resource.getDecoder('update');
        let data = await jsonReader(incoming);
        data = decode(data, {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: endpointMeta.controller,
          http: incoming,
          contentId,
          resource,
          endpoint: 'update',
          data,
          params: {
            ...this.parseParameters(incoming.parsedUrl, endpointMeta),
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

  getBodyLoader(endpoint:
                    OpraSchema.Collection.CreateEndpoint |
                    OpraSchema.Collection.UpdateEndpoint |
                    OpraSchema.Collection.UpdateManyEndpoint
  ): BodyLoaderFunction {
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

