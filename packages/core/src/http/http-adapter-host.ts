import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import * as vg from 'valgen';
import {
  BadRequestError,
  Collection, ComplexType,
  Container,
  HttpHeaderCodes,
  HttpStatusCodes,
  InternalServerError, isReadable,
  IssueSeverity,
  MethodNotAllowedError,
  OpraException,
  OpraSchema,
  OpraURL, OpraURLPath,
  OpraURLPathComponent,
  Parameter,
  Resource, ResourceNotFoundError,
  Singleton,
  Storage,
  translate,
  uid,
  wrapException
} from '@opra/common';
import { ExecutionContextHost } from '../execution-context.host.js';
import { ExecutionContext } from '../execution-context.js';
import { PlatformAdapterHost } from '../platform-adapter.host.js';
import type { Protocol } from '../platform-adapter.js';
import { RequestHost } from '../request.host.js';
import { Request } from '../request.js';
import { RequestContext } from '../request-context.js';
import { ResponseHost } from '../response.host.js';
import { Response } from '../response.js';
import { jsonBodyLoader } from './helpers/json-body-loader.js';
import { MultipartIterator } from './helpers/multipart-helper.js';
import { HttpServerRequest } from './http-server-request.js';
import { HttpServerResponse } from './http-server-response.js';

/**
 *
 * @class HttpAdapterHost
 */
export abstract class HttpAdapterHost extends PlatformAdapterHost {
  protected _protocol = 'http' as Protocol;
  protected _tempDir = os.tmpdir();

  /**
   * Main http request handler
   * @param incoming
   * @param outgoing
   * @protected
   */
  protected async handleHttp(incoming: HttpServerRequest, outgoing: HttpServerResponse): Promise<void> {
    const context = new ExecutionContextHost(this.api, this.platform, {http: {incoming, outgoing}});
    try {
      try {
        /* istanbul ignore next */
        if (!this._api)
          throw new InternalServerError(`${Object.getPrototypeOf(this).constructor.name} has not been initialized yet`);

        outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
        // Expose headers if cors enabled
        if (outgoing.getHeader(HttpHeaderCodes.Access_Control_Allow_Origin)) {
          // Expose X-Opra-* headers
          outgoing.appendHeader(HttpHeaderCodes.Access_Control_Expose_Headers,
              Object.values(HttpHeaderCodes)
                  .filter(k => k.toLowerCase().startsWith('x-opra-'))
          );
        }

        const {parsedUrl} = incoming;
        if (!parsedUrl.path.length) {
          if (incoming.method === 'GET') {
            outgoing.setHeader('content-type', 'application/json');
            outgoing.end(JSON.stringify(this.api.exportSchema({webSafe: true})));
            return;
          }
          // Process Batch
          if (incoming.method === 'POST' && incoming.headers['content-type'] === 'multipart/mixed') {
            // todo Process Batch
          }
          throw new BadRequestError();
        }

        let i = 0;
        let requestProcessed = false;
        const next = async () => {
          const interceptor = this._interceptors[i++];
          if (interceptor) {
            await interceptor(context, next);
            await next();
          } else if (!requestProcessed) {
            requestProcessed = true;
            await this.handleExecution(context);
          }
        }
        await next();
      } catch (error) {
        context.errors.push(wrapException(error));
      }
      // If no response returned to the client we send an error
      if (!outgoing.writableEnded) {
        if (!context.errors.length)
          context.errors.push(new BadRequestError(`Server can not process this request`));
        await this.handleError(context);
      }
    } finally {
      await (context as ExecutionContextHost).emitAsync('finish');
    }
  }

  async handleExecution(executionContext: ExecutionContext): Promise<void> {
    // Parse incoming message and create Request object
    const request = await this.parseRequest(executionContext);
    const {outgoing} = executionContext.switchToHttp();
    const response: Response = new ResponseHost({http: outgoing});
    const context = RequestContext.from(executionContext, request, response);
    await this.executeRequest(context);
    if (response.errors.length) {
      context.errors.push(...response.errors);
      return;
    }
    try {
      await this.sendResponse(context);
    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      if (e instanceof vg.ValidationError) {
        throw new InternalServerError({
          message: translate('error:RESPONSE_VALIDATION,', 'Response validation failed'),
          code: 'RESPONSE_VALIDATION',
          details: e.issues
        }, e);
      }
      throw new InternalServerError(e);
    }
  }

  async parseRequest(executionContext: ExecutionContext): Promise<Request> {
    const {incoming} = executionContext.switchToHttp();
    const parsedUrl = new OpraURL(incoming.url);
    let i = 0;
    let p: OpraURLPathComponent;
    let resource: Resource = this.api.root;
    let request: RequestHost | undefined;
    // Walk through container
    while (resource instanceof Container && i < parsedUrl.path.length) {
      p = parsedUrl.path[i];
      const r = resource.resources.get(p.resource);
      if (r) {
        resource = r;
        if (resource instanceof Container) {
          i++;
        } else break;
      } else break;
    }
    const urlPath = i > 0 ? parsedUrl.path.slice(i) : parsedUrl.path;
    const searchParams = parsedUrl.searchParams;
    // If there is one more element in the path it may be an action
    if (resource instanceof Container) {
      if (urlPath.length === 1 && resource.actions.has(urlPath[0].resource)) {
        request = await this._parseRequestAction(executionContext, resource, urlPath, searchParams);
        if (request)
          return request;
      }
    } else if (urlPath.length === 2 && resource.actions.has(urlPath[1].resource)) {
      request = await this._parseRequestAction(executionContext, resource, urlPath.slice(1), searchParams);
      if (request)
        return request;
    }

    if (resource instanceof Storage)
      request = await this._parseRequestStorage(executionContext, resource, urlPath.slice(1), searchParams);
    else if (urlPath.length === 1) { // Collection and Singleton resources should be last element in path
      if (resource instanceof Collection)
        request = await this._parseRequestCollection(executionContext, resource, urlPath, searchParams);
      else if (resource instanceof Singleton)
        request = await this._parseRequestSingleton(executionContext, resource, urlPath, searchParams);
    }

    if (request)
      return request;

    const path = urlPath.toString();
    throw new BadRequestError({
      message: 'No resource or endpoint found at ' + path,
      details: {path}
    });
  }

  protected async _parseRequestAction(
      executionContext: ExecutionContext,
      resource: Resource,
      urlPath: OpraURLPath,
      searchParams: URLSearchParams
  ): Promise<RequestHost> {
    const p = urlPath[0];
    const {controller, endpoint, handler} = await this.getActionHandler(resource, p.resource);
    const {incoming} = executionContext.switchToHttp();
    const contentId = incoming.headers['content-id'] as string;
    const params = this.parseParameters(endpoint.parameters, p, searchParams);
    return new RequestHost({
      endpoint,
      controller,
      handler,
      http: incoming,
      contentId,
      params
    });
  }

  protected async _parseRequestCollection(
      executionContext: ExecutionContext,
      resource: Collection,
      urlPath: OpraURLPath,
      searchParams: URLSearchParams
  ): Promise<RequestHost> {
    const {incoming} = executionContext.switchToHttp();
    if ((incoming.method === 'POST' || incoming.method === 'PATCH') && !incoming.is('json'))
      throw new BadRequestError({message: 'Unsupported Content-Type'});

    const contentId = incoming.headers['content-id'] as string;
    const p = urlPath[0];
    switch (incoming.method) {
      case 'POST': {
        if (p.key == null) {
          const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'create');
          const jsonReader = jsonBodyLoader({limit: endpoint.inputMaxContentSize}, endpoint);
          let data = await jsonReader(incoming);
          data = endpoint.decodeInput(data, {coerce: true});
          const params = this.parseParameters(endpoint.parameters, p, searchParams);
          return new RequestHost({
            endpoint,
            controller,
            handler,
            http: incoming,
            contentId,
            data,
            params: {
              ...params,
              pick: params.pick && resource.normalizeFieldPath(params.pick),
              omit: params.omit && resource.normalizeFieldPath(params.omit),
              include: params.include && resource.normalizeFieldPath(params.include)
            }
          });
        }
        break;
      }
      case 'DELETE': {
        if (p.key != null) {
          const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'delete');
          const params = this.parseParameters(endpoint.parameters, p, searchParams);
          return new RequestHost({
            endpoint,
            controller,
            handler,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            params
          });
        }
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'deleteMany');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          params: {
            ...params,
            filter: params.filter && resource.normalizeFilter(params.filter)
          }
        });
      }

      case 'GET': {
        if (p.key != null) {
          const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'get');
          const params = this.parseParameters(endpoint.parameters, p, searchParams);
          return new RequestHost({
            endpoint,
            controller,
            handler,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            params: {
              ...params,
              pick: params.pick && resource.normalizeFieldPath(params.pick),
              omit: params.omit && resource.normalizeFieldPath(params.omit),
              include: params.include && resource.normalizeFieldPath(params.include)
            }
          });
        }
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'findMany');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          params: {
            ...params,
            pick: params.pick && resource.normalizeFieldPath(params.pick),
            omit: params.omit && resource.normalizeFieldPath(params.omit),
            include: params.include && resource.normalizeFieldPath(params.include),
            sort: params.sort && resource.normalizeSortFields(params.sort),
            filter: params.filter && resource.normalizeFilter(params.filter)
          }
        });
      }

      case 'PATCH': {
        if (p.key != null) {
          const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'update');
          const jsonReader = jsonBodyLoader({limit: endpoint.inputMaxContentSize}, endpoint);
          let data = await jsonReader(incoming);
          data = endpoint.decodeInput(data, {coerce: true});
          const params = this.parseParameters(endpoint.parameters, p, searchParams);
          return new RequestHost({
            endpoint,
            controller,
            handler,
            http: incoming,
            contentId,
            key: resource.parseKeyValue(p.key),
            data,
            params: {
              ...params,
              pick: params.pick && resource.normalizeFieldPath(params.pick),
              omit: params.omit && resource.normalizeFieldPath(params.omit),
              include: params.include && resource.normalizeFieldPath(params.include),
            }
          });
        }
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'updateMany');
        const jsonReader = jsonBodyLoader({limit: endpoint.inputMaxContentSize}, endpoint);
        let data = await jsonReader(incoming);
        data = endpoint.decodeInput(data, {coerce: true});
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          data,
          params: {
            ...params,
            filter: params.filter && resource.normalizeFilter(params.filter)
          }
        });
      }
    }
    throw new MethodNotAllowedError({
      message: `Collection resource doesn't accept http "${incoming.method}" method`
    });
  }

  protected async _parseRequestSingleton(
      executionContext: ExecutionContext,
      resource: Singleton,
      urlPath: OpraURLPath,
      searchParams?: URLSearchParams
  ): Promise<RequestHost> {
    const {incoming} = executionContext.switchToHttp();
    if ((incoming.method === 'POST' || incoming.method === 'PATCH') && !incoming.is('json'))
      throw new BadRequestError({message: 'Unsupported Content-Type'});

    const contentId = incoming.headers['content-id'] as string;
    const p = urlPath[0];
    switch (incoming.method) {
      case 'POST': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'create');
        const jsonReader = jsonBodyLoader({limit: endpoint.inputMaxContentSize}, endpoint);
        let data = await jsonReader(incoming);
        data = endpoint.decodeInput(data, {coerce: true});
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          data,
          params: {
            ...params,
            pick: params.pick && resource.normalizeFieldPath(params.pick),
            omit: params.omit && resource.normalizeFieldPath(params.omit),
            include: params.include && resource.normalizeFieldPath(params.include)
          }
        });
      }
      case 'DELETE': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'delete');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          params
        });
      }

      case 'GET': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'get');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          params: {
            ...params,
            pick: params.pick && resource.normalizeFieldPath(params.pick),
            omit: params.omit && resource.normalizeFieldPath(params.omit),
            include: params.include && resource.normalizeFieldPath(params.include)
          }
        });
      }

      case 'PATCH': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'update');
        const jsonReader = jsonBodyLoader({limit: endpoint.inputMaxContentSize}, endpoint);
        let data = await jsonReader(incoming);
        data = endpoint.decodeInput(data, {coerce: true});
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          data,
          params: {
            ...params,
            pick: params.pick && resource.normalizeFieldPath(params.pick),
            omit: params.omit && resource.normalizeFieldPath(params.omit),
            include: params.include && resource.normalizeFieldPath(params.include),
          }
        });
      }
    }
    throw new MethodNotAllowedError({
      message: `Singleton resource doesn't accept http "${incoming.method}" method`
    });
  }

  protected async _parseRequestStorage(
      executionContext: ExecutionContext,
      resource: Storage,
      urlPath: OpraURLPath,
      searchParams: URLSearchParams
  ): Promise<RequestHost> {
    const {incoming} = executionContext.switchToHttp();
    const contentId = incoming.headers['content-id'] as string;
    const p = urlPath[0];
    switch (incoming.method) {
      case 'GET': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'get');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          path: incoming.parsedUrl.path.slice(1).toString().substring(1),
          params
        });
      }
      case 'DELETE': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'delete');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          path: incoming.parsedUrl.path.slice(1).toString().substring(1),
          params
        });
      }
      case 'POST': {
        const {controller, endpoint, handler} = await this.getOperationHandler(resource, 'post');
        const params = this.parseParameters(endpoint.parameters, p, searchParams);
        await fs.mkdir(this._tempDir, {recursive: true});

        const multipartIterator = new MultipartIterator(incoming, {
          ...endpoint.options,
          filename: () => this.serviceName + '_p' + process.pid +
              't' + String(Date.now()).substring(8) + 'r' + uid(12)
        });
        multipartIterator.pause();

        // Add an hook to clean up files after request finished
        executionContext.on('finish', async () => {
          multipartIterator.cancel();
          await multipartIterator.deleteFiles().catch(() => void 0);
        });

        return new RequestHost({
          endpoint,
          controller,
          handler,
          http: incoming,
          contentId,
          parts: multipartIterator,
          path: incoming.parsedUrl.path.slice(1).toString().substring(1),
          params
        });
      }
    }
    throw new MethodNotAllowedError({
      message: `Storage resource doesn't accept http "${incoming.method}" method`
    });
  }

  protected parseParameters(
      paramDefs: Map<string, Parameter>,
      pathComponent: OpraURLPathComponent,
      searchParams?: URLSearchParams
  ): Record<string, any> {
    const out = {};
    // Parse known parameters
    for (const [k, prm] of paramDefs.entries()) {
      const decode = prm.getDecoder();
      let v: any = searchParams?.getAll(k);
      try {
        if (!prm.isArray) {
          v = v[0];
          v = decode(v, {coerce: true});
        } else {
          v = v.map(x => decode(x, {coerce: true})).flat();
          if (!v.length)
            v = undefined;
        }
        if (v !== undefined)
          out[k] = v;
      } catch (e: any) {
        e.message = `Error parsing parameter ${k}. ` + e.message;
        throw e;
      }
    }
    // Add unknown parameters
    if (searchParams) {
      for (const k of searchParams.keys()) {
        let v: any = searchParams.getAll(k);
        if (v.length < 2)
          v = v[0];
        if (!paramDefs.has(k))
          out[k] = v;
      }
    }
    return out;
  }

  protected async executeRequest(context: RequestContext): Promise<void> {
    const {request} = context;
    const {response} = context;
    const {resource, handler} = request;
    // Call endpoint handler method
    let value: any;
    try {
      value = await handler.call(request.controller, context);
      if (response.value == null)
        response.value = value;

      // Normalize response value
      if (request.endpoint.kind === 'operation' &&
          (resource instanceof Collection || resource instanceof Singleton || resource instanceof Storage)
      ) {
        const {endpoint} = request;
        const operationName = endpoint.name;

        if (operationName === 'delete' || operationName === 'deleteMany' || operationName === 'updateMany') {
          let affected = 0;
          if (typeof value === 'number')
            affected = value;
          if (typeof value === 'boolean')
            affected = value ? 1 : 0;
          if (typeof value === 'object')
            affected = value.affected || value.affectedRows ||
                (operationName === 'updateMany' ? value.updated : value.deleted);
          response.value = affected;
          return;
        }

        if (resource instanceof Storage)
          return;

        // "get" and "update" endpoints must return the entity instance, otherwise it means resource not found
        if (value == null && (operationName === 'get' || operationName === 'update'))
          throw new ResourceNotFoundError(resource.name, (request as RequestHost).key);

        // "findMany" endpoint should return array of entity instances
        if (operationName === 'findMany')
          value = (value == null ? [] : Array.isArray(value) ? value : [value]);
        else
          value = value == null ? {} : Array.isArray(value) ? value[0] : value;
        value = endpoint.encodeReturning(value, {coerce: true});
        response.value = value;
        return;
      }

      const {endpoint} = request;
      if (response.value)
        response.value = endpoint.encodeReturning(response.value, {coerce: true});

    } catch (error) {
      response.errors.push(error);
    }
  }

  async sendResponse(context: RequestContext): Promise<void> {
    const {request, response} = context;
    const {endpoint, resource} = request;
    const outgoing = response.switchToHttp();

    if (endpoint.kind === 'operation' &&
        (
            resource instanceof Collection || resource instanceof Singleton ||
            (resource instanceof Storage && endpoint.name !== 'get')
        )
    ) {
      const returnType = endpoint.returnType;
      const operationName = endpoint.name;
      const body: any = {
        context: resource.getFullPath(),
        operation: operationName
      };

      if (operationName === 'delete' || operationName === 'deleteMany' || operationName === 'updateMany') {
        body.affected = response.value;
      } else {
        if (!response.value)
          throw new InternalServerError(`"${request.endpoint.name}" endpoint should return value`);
        assert(returnType instanceof ComplexType);
        body.type = returnType.name || '#anonymous';
        body.data = this.i18n.deep(response.value);
        if (operationName === 'create')
          outgoing.statusCode = 201;
        if (operationName === 'create' || operationName === 'update')
          body.affected = 1;
        else if (operationName === 'get' || operationName === 'update')
          body.key = request.key;
        if (operationName === 'findMany' && response.count != null && response.count >= 0)
          body.totalCount = response.count;
      }
      outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
      outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/opra+json; charset=utf-8');
      outgoing.send(JSON.stringify(body));
      outgoing.end();
      return;
    }

    // Storage "get" resource
    if (endpoint.kind === 'action') {
    //
    }

    outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
    if (response.value != null) {
      if (typeof response.value === 'string') {
        if (!outgoing.hasHeader('content-type'))
          outgoing.setHeader('content-type', 'text/plain');
        outgoing.send(response.value);
      } else if (Buffer.isBuffer(response.value) || isReadable(response.value)) {
        if (!outgoing.hasHeader('content-type'))
          outgoing.setHeader('content-type', 'application/octet-stream');
        outgoing.send(response.value);
      } else {
        outgoing.setHeader('content-type', 'application/json; charset=utf-8');
        outgoing.send(JSON.stringify(response.value));
      }
    }
    outgoing.end();
  }

  protected async handleError(context: ExecutionContext): Promise<void> {
    const {errors} = context;
    const {outgoing} = context.switchToHttp();
    if (outgoing.headersSent) {
      outgoing.end();
      return;
    }
    errors.forEach(x => {
      if (x instanceof OpraException) {
        switch (x.severity) {
          case "fatal":
            this._logger.fatal(x);
            break;
          case "warning":
            this._logger.warn(x);
            break;
          default:
            this._logger.error(x);
        }
      } else this._logger.fatal(x);
    });

    const wrappedErrors = errors.map(wrapException);
    // Sort errors from fatal to info
    wrappedErrors.sort((a, b) => {
      const i = IssueSeverity.Keys.indexOf(a.severity) - IssueSeverity.Keys.indexOf(b.severity);
      if (i === 0)
        return b.status - a.status;
      return i;
    });

    let status = outgoing.statusCode || 0;
    if (!status || status < Number(HttpStatusCodes.BAD_REQUEST)) {
      status = wrappedErrors[0].status;
      if (status < Number(HttpStatusCodes.BAD_REQUEST))
        status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
    outgoing.statusCode = status;

    const body = {
      errors: wrappedErrors.map(x => this._i18n.deep(x.toJSON()))
    };

    outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/opra+json; charset=utf-8');
    outgoing.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Expires, '-1');
    outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

}
