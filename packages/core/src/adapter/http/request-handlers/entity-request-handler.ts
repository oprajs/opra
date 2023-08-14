import bodyParser from 'body-parser';
import { toBoolean, toInt } from 'putil-varhelpers';
import {
  BadRequestError, Collection, HttpHeaderCodes, HttpStatusCodes,
  InternalServerError, MethodNotAllowedError, OpraException,
  OpraSchema, ResourceNotFoundError, Singleton,
} from '@opra/common';
import { ExecutionContext } from '../../execution-context.js';
import { OperationContext } from '../../operation-context.js';
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
    const context = OperationContext.from(executionContext, request, response);
    // Execute operation
    await this.executeOperation(context);
    if (response.errors.length) {
      context.errors.push(...response.errors);
      return;
    }
    await this.sendResponse(context);
  }

  async parseRequest(incoming: HttpServerRequest): Promise<Request | undefined> {
    const p = incoming.parsedUrl.path[0];
    const resource = this.adapter.api.getResource(p.resource);
    try {
      if (resource instanceof Collection)
        return await this.parseCollectionRequest(resource, incoming);
      if (resource instanceof Singleton)
        return await this.parseSingletonRequest(resource, incoming);
    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      throw new BadRequestError(e);
    }
  }

  async executeOperation(context: OperationContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    const resource = request.resource as (Collection | Singleton);
    // Call operation handler method
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
        // "get" and "update" operations must return the entity instance, otherwise it means resource not found
        if (value == null && (request.operation === 'get' || request.operation === 'update'))
          throw new ResourceNotFoundError(resource.name, (request as RequestHost).key);
        // "findMany" operation should return array of entity instances
        if (request.operation === 'findMany')
          value = value == null ? [] : Array.isArray(value) ? value : [value];
        else value = value == null ? {} : Array.isArray(value) ? value[0] : value;
        response.value = value;
      }
    } catch (error) {
      response.errors.push(error);
    }
  }

  async sendResponse(context: OperationContext): Promise<void> {
    const {request, response} = context;
    const resource = request.resource as (Collection | Singleton);
    const outgoing = response.switchToHttp();

    let responseObject: any;
    if (request.operation === 'delete' || request.operation === 'deleteMany' || request.operation === 'updateMany') {
      responseObject = {
        resource: resource.name,
        operation: request.operation,
        affected: response.value
      }
    } else {
      if (!response.value)
        throw new InternalServerError(`"${request.operation}" operation should return value`);
      const encode = resource.getEncoder(request.operation as any);
      const data = encode(response.value, {coerce: true});
      if (request.operation === 'create')
        outgoing.statusCode = 201;
      responseObject = {
        resource: resource.name,
        operation: request.operation,
        data
      }
      if (request.operation === 'create' || request.operation === 'update')
        responseObject.affected = 1;
      if (request.operation === 'findMany' && response.count != null && response.count >= 0)
        responseObject.totalCount = response.count;
    }

    outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
    const body = this.adapter._i18n.deep(responseObject);
    outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

  async parseCollectionRequest(resource: Collection, incoming: HttpServerRequest): Promise<Request> {
    if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
        incoming.headers['content-type'] !== 'application/json')
      throw new BadRequestError({message: 'Unsupported Content-Type'});

    const contentId = incoming.headers['content-id'] as string;
    const p = incoming.parsedUrl.path[0];
    const params = incoming.parsedUrl.searchParams;
    switch (incoming.method) {
      case 'POST': {
        if (p.key == null) {
          const operationMeta =
              await this.assertOperation<OpraSchema.Collection.CreateOperation>(resource, 'create');
          const jsonReader = this.getBodyLoader(operationMeta);
          const decode = resource.getDecoder('create');
          const data = decode(await jsonReader(incoming), {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            contentId,
            resource,
            operation: 'create',
            data,
            params: {
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
          const operationMeta =
              await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'delete');
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            contentId,
            resource,
            operation: 'delete',
            key: resource.parseKeyValue(p.key)
          });
        }
        const operationMeta =
            await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'deleteMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'deleteMany',
          params: {
            filter
          }
        });
      }

      case 'GET': {
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        if (p.key != null) {
          const operationMeta =
              await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'get');
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            contentId,
            resource,
            operation: 'get',
            key: resource.parseKeyValue(p.key),
            params: {
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include)
            }
          });
        }
        const operationMeta =
            await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'findMany');
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        const sort = parseArrayParam(params.get('$sort'));
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'findMany',
          params: {
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
          const operationMeta =
              await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'update');
          const jsonReader = this.getBodyLoader(operationMeta);
          const decode = resource.getDecoder('update');
          const data = decode(await jsonReader(incoming), {coerce: true});
          const pick = parseArrayParam(params.get('$pick'));
          const omit = parseArrayParam(params.get('$omit'));
          const include = parseArrayParam(params.get('$include'));
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            contentId,
            resource,
            operation: 'update',
            key: resource.parseKeyValue(p.key),
            data,
            params: {
              pick: pick && resource.normalizeFieldPath(pick),
              omit: omit && resource.normalizeFieldPath(omit),
              include: include && resource.normalizeFieldPath(include),
            }
          });
        }
        const operationMeta =
            await this.assertOperation<OpraSchema.Collection.DeleteOperation>(resource, 'updateMany');
        const jsonReader = this.getBodyLoader(operationMeta);
        const decode = resource.getDecoder('updateMany');
        const data = decode(await jsonReader(incoming), {coerce: true});
        const filter = resource.normalizeFilter(params.get('$filter') as any);
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'updateMany',
          data,
          params: {
            filter,
          }
        });
      }
    }
    throw new MethodNotAllowedError({
      message: `Collection resources do not accept http "${incoming.method}" method`
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
        const operationMeta =
            await this.assertOperation<OpraSchema.Singleton.DeleteOperation>(resource, 'create');
        const jsonReader = this.getBodyLoader(operationMeta);
        const decode = resource.getDecoder('create');
        const data = decode(await jsonReader(incoming), {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'create',
          data,
          params: {
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      case 'DELETE': {
        const operationMeta =
            await this.assertOperation<OpraSchema.Singleton.DeleteOperation>(resource, 'delete');
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'delete',
        });
      }

      case 'GET': {
        const operationMeta =
            await this.assertOperation<OpraSchema.Singleton.DeleteOperation>(resource, 'get');
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'get',
          params: {
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });

      }

      case 'PATCH': {
        const operationMeta =
            await this.assertOperation<OpraSchema.Singleton.DeleteOperation>(resource, 'update');
        const jsonReader = this.getBodyLoader(operationMeta);
        const decode = resource.getDecoder('update');
        const data = decode(await jsonReader(incoming), {coerce: true});
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          controller: operationMeta.controller,
          http: incoming,
          contentId,
          resource,
          operation: 'update',
          data,
          params: {
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include),
          }
        });

      }
    }
    throw new MethodNotAllowedError({
      message: `Singleton resources do not accept http "${incoming.method}" method`
    });
  }

  getBodyLoader(operation:
                    OpraSchema.Collection.CreateOperation |
                    OpraSchema.Collection.UpdateOperation |
                    OpraSchema.Collection.UpdateManyOperation
  ): BodyLoaderFunction {
    let bodyLoader = this.bodyLoaders.get(operation);
    if (!bodyLoader) {
      const parser = bodyParser.json({
        limit: operation.input?.maxContentSize,
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
      this.bodyLoaders.set(operation, bodyLoader);
    }
    return bodyLoader;
  }

}

