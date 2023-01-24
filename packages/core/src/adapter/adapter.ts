import { Task } from 'power-tasks';
import { AsyncEventEmitter } from 'strict-typed-events';
import {
  CollectionCountQuery,
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery,
  CollectionResourceInfo,
  CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  ComplexType,
  DataType,
  FailedDependencyError,
  FieldGetQuery,
  ForbiddenError,
  HttpHeaderCodes,
  I18n,
  InternalServerError,
  OpraDocument,
  OpraException,
  ResourceInfo,
  ResourceNotFoundError,
  ResponsiveMap,
  SingletonGetQuery,
  SingletonResourceInfo,
  translate,
  wrapException
} from '@opra/common';
import { IExecutionContext } from '../interfaces/execution-context.interface.js';
import { I18nOptions } from '../interfaces/i18n-options.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { IResource } from '../interfaces/resource.interface.js';
import { createI18n } from '../utils/create-i18n.js';
import { MetadataResource } from './classes/metadata.resource.js';
import { BatchRequestContext } from './request-contexts/batch-request-context.js';
import { RequestContext } from './request-contexts/request-context.js';
import { SingleRequestContext } from './request-contexts/single-request-context.js';

const noOp = () => void 0;

export namespace OpraAdapter {
  export type UserContextResolver = (executionContext: IExecutionContext) => object | Promise<object>;

  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    userContext?: UserContextResolver;
    logger?: ILogger;
  }

}

export abstract class OpraAdapter<TExecutionContext extends IExecutionContext> {
  protected userContextResolver?: OpraAdapter.UserContextResolver;
  protected _internalResources = new ResponsiveMap<string, ResourceInfo>();
  i18n: I18n;
  logger?: ILogger;

  constructor(readonly document: OpraDocument) {
  }

  async close() {
    const promises: Promise<void>[] = [];
    for (const r of this.document.resources.values()) {
      if (r.instance) {
        const shutDown = (r.instance as IResource).shutDown;
        if (shutDown)
          promises.push((async () => shutDown.call(r.instance))());
      }
    }
    await Promise.allSettled(promises);
  }

  protected abstract parse(executionContext: TExecutionContext): Promise<RequestContext>;

  protected abstract sendResponse(executionContext: TExecutionContext, requestContext: RequestContext): Promise<void>;

  protected abstract sendError(executionContext: TExecutionContext, error: OpraException): Promise<void>;

  protected async handler(executionContext: TExecutionContext): Promise<void> {
    let requestContext: RequestContext | undefined;
    let failed = false;
    try {
      if (this.userContextResolver)
        executionContext.userContext = this.userContextResolver(executionContext);
      requestContext = await this.parse(executionContext);
      const task = this._requestContextToTask(executionContext, requestContext);
      await task.toPromise().catch(noOp);
      await this.sendResponse(executionContext, requestContext);
    } catch (e: any) {
      failed = true;
      const error = wrapException(e);
      await this.sendError(executionContext, error);
      if (this.logger)
        try {
          this.logger.error(e);
        } catch {
          // noop
        }
    } finally {
      if (executionContext as unknown instanceof AsyncEventEmitter) {
        await (executionContext as unknown as AsyncEventEmitter)
            .emitAsyncSerial('finish', {
              context: executionContext,
              failed
            }).catch();
      }
    }
  }

  protected _requestContextToTask(
      executionContext: TExecutionContext,
      requestContext: RequestContext
  ): Task {
    if (requestContext instanceof BatchRequestContext) {
      const children = requestContext.queries.map(q => this._requestContextToTask(executionContext, q));
      return new Task(children, {bail: true});
    } else if (requestContext instanceof SingleRequestContext) {
      const {query} = requestContext;
      const task = new Task(async () => {
        if (query.resource) {
          const {resource} = query;
          // call pre_xxx method
          const fn = resource.metadata['pre_' + query.method];
          if (fn && typeof fn === 'function') {
            await fn(requestContext);
          }
          await this._executeResourceQuery(this.document, resource, requestContext);
          // todo execute sub property queries
          return;
        }
        throw new InternalServerError('Not implemented yet');
      }, {
        id: requestContext.contentId,
        exclusive: query.operation !== 'read'
      });
      task.on('finish', () => {
        if (task.error) {
          if (task.failedDependencies)
            requestContext.errors.push(new FailedDependencyError());
          else
            requestContext.errors.push(wrapException(task.error));
          if (this.logger)
            try {
              this.logger.error(task.error);
            } catch {
              // noop
            }
          return;
        }
      });
      return task;
    }
    /* istanbul ignore next */
    throw new TypeError('Invalid request context instance');
  }

  protected async _init(options?: OpraAdapter.Options) {
    this.logger = options?.logger;
    if (options?.i18n instanceof I18n)
      this.i18n = options.i18n;
    else if (typeof options?.i18n === 'function')
      this.i18n = await options.i18n();
    else this.i18n = await createI18n(options?.i18n);
    this.i18n = this.i18n || I18n.defaultInstance;
    if (!this.i18n.isInitialized)
      await this.i18n.init();

    this.userContextResolver = options?.userContext;

    const metadataResource = new MetadataResource();
    const metadataResourceInfo = new SingletonResourceInfo(this.document, '$metadata',
        this.document.getComplexDataType('object'), {
          kind: 'SingletonResource',
          type: 'object',
          instance: metadataResource,
          get: {
            handler: metadataResource.get.bind(metadataResource)
          }
        });
    this._internalResources.set(metadataResourceInfo.name, metadataResourceInfo);
    metadataResource.init(metadataResourceInfo);

    for (const r of this.document.resources.values()) {
      if (r.instance) {
        const init = (r.instance as IResource).init;
        if (init)
          await init.call(r.instance, r);
      }
    }
  }

  protected async _executeResourceQuery(document: OpraDocument, resource: ResourceInfo, context: SingleRequestContext) {
    if (resource instanceof CollectionResourceInfo) {
      const {query} = context;
      if (query instanceof CollectionSearchQuery) {
        const promises: Promise<any>[] = [];
        let search: any;
        promises.push(
            this._executeCollectionResource(document, resource, context)
                .then(v => search = v)
        );
        if (query.count && resource.metadata.count) {
          const ctx = {
            query: new CollectionCountQuery(query.resource, {filter: query.filter}),
            resultPath: ''
          } as SingleRequestContext;
          Object.setPrototypeOf(ctx, context);
          promises.push(
              this._executeCollectionResource(document, resource, ctx)
                  .then(r => {
                    context.responseHeaders[HttpHeaderCodes.X_Opra_Count] = r;
                  }));
        }
        await Promise.all(promises);
        context.response = search;
        return;
      }
      context.response = await this._executeCollectionResource(document, resource, context);
      return;
    } else if (resource instanceof SingletonResourceInfo) {
      context.response = await this._executeSingletonResource(document, resource, context);
      return;
    }
    throw new Error(`Executing "${resource.kind}" has not been implemented yet`);
  }

  protected async _executeCollectionResource(document: OpraDocument, resource: CollectionResourceInfo, context: SingleRequestContext) {
    const method = context.query.method;
    const handler = resource.getHandler(method);
    if (!handler)
      throw new ForbiddenError({
        message: translate('RESOLVER_FORBIDDEN', {method},
            `The resource endpoint does not accept '{{method}}' operations`),
        severity: 'error',
        code: 'RESOLVER_FORBIDDEN'
      });
    let result;

    switch (method) {
      case 'create': {
        const query = context.query as CollectionCreateQuery;
        result = await handler(context, query.data, query);
        result = Array.isArray(result) ? result[0] : result;
        if (result)
          context.status = 201;
        context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = resource.dataType.name;
        return result;
      }
      case 'count': {
        const query = context.query as CollectionCountQuery;
        result = await handler(context, query);
        return result;
      }
      case 'get': {
        const query = context.query as CollectionGetQuery;
        result = await handler(context, query.keyValue, query);
        result = Array.isArray(result) ? result[0] : result;
        if (!result)
          throw new ResourceNotFoundError(resource.name, query.keyValue);
        const v = await this._pathWalkThrough(query, query.dataType, result, resource.name);
        if (v.value === undefined)
          throw new ResourceNotFoundError(v.path);
        if (v.dataType)
          context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = v.dataType.name;
        return v.value;
      }
      case 'search': {
        const query = context.query as CollectionSearchQuery;
        result = await handler(context, query);
        const items = Array.isArray(result) ? result : (context.response ? [result] : []);
        context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = resource.dataType.name;
        return items;
      }
      case 'update': {
        const query = context.query as CollectionUpdateQuery;
        result = await handler(context, query.keyValue, query.data, query);
        result = Array.isArray(result) ? result[0] : result;
        if (!result)
          throw new ResourceNotFoundError(resource.name, query.keyValue);
        context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = resource.dataType.name;
        return result;
      }
      case 'delete':
      case 'deleteMany':
      case 'updateMany': {
        switch (method) {
          case 'delete': {
            const query = context.query as CollectionDeleteQuery;
            result = await handler(context, query.keyValue, query);
            break;
          }
          case 'deleteMany': {
            const query = context.query as CollectionDeleteManyQuery;
            result = await handler(context, query);
            break;
          }
          case 'updateMany': {
            const query = context.query as CollectionUpdateManyQuery;
            result = await handler(context, query.data, query);
            break;
          }
        }
        let affected;
        if (typeof result === 'number')
          affected = result;
        if (typeof result === 'boolean')
          affected = result ? 1 : 0;
        if (typeof result === 'object')
          affected = result.affectedRows || result.affected;
        return {
          operation: context.query.method,
          affected
        };
      }
    }
  }

  protected async _executeSingletonResource(document: OpraDocument, resource: SingletonResourceInfo, context: SingleRequestContext) {
    const method = context.query.method;
    const resolverInfo = resource.metadata[method];
    if (!(resolverInfo && resolverInfo.handler))
      throw new ForbiddenError({
        message: translate('RESOLVER_FORBIDDEN', {method},
            `The resource endpoint does not accept '{{method}}' operations`),
        severity: 'error',
        code: 'RESOLVER_FORBIDDEN'
      });
    let result = await resolverInfo.handler(context);
    switch (method) {
      case 'get': {
        const query = context.query as SingletonGetQuery;
        result = await resolverInfo.handler(context, query);
        result = Array.isArray(result) ? result[0] : result;
        if (!result)
          throw new ResourceNotFoundError(resource.name);
        const v = await this._pathWalkThrough(query, query.dataType, result, resource.name);
        if (v.value === undefined)
          throw new ResourceNotFoundError(v.path);
        if (v.dataType)
          context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = v.dataType.name;
        return v.value;
      }
    }

    if (!result)
      return;

    result = Array.isArray(result) ? result[0] : result;

    let dataType: DataType | undefined = resource.dataType;
    if (context.resultPath) {
      const pathArray = context.resultPath.split('.');
      for (const field of pathArray) {
        const prop = dataType instanceof ComplexType ? dataType.fields.get(field) : undefined;
        dataType = prop && prop.type ? this.document.types.get(prop.type) : undefined;
        result = result && typeof result === 'object' && result[field];
      }
    }

    if (method === 'create')
      context.status = 201;

    context.responseHeaders[HttpHeaderCodes.X_Opra_DataType] = resource.dataType.name;
    return result;
  }

  protected async _pathWalkThrough(
      query: CollectionGetQuery | SingletonGetQuery | FieldGetQuery,
      dataType: ComplexType,
      value: any,
      parentPath: string
  ): Promise<{
    value?: any;
    dataType?: DataType;
    path: string;
  }> {
    const {child} = query;
    if (!child)
      return {value, dataType, path: parentPath};
    // Make a case in sensitive lookup
    const fieldNameLower = child.fieldName.toLowerCase();
    const path = parentPath + (parentPath ? '.' : '') + child.fieldName;
    for (const key of Object.keys(value)) {
      if (key.toLowerCase() === fieldNameLower) {

        let v = value[key];
        if (v == null)
          return {path};
        if (child.child && child.dataType instanceof ComplexType) {
          if (Array.isArray(v))
            v = v[0];
          return this._pathWalkThrough(child, child.dataType, v, path);
        }
        return {value: v, dataType: child.dataType, path};
      }
    }
    return {path};
  }

}
