import { AsyncEventEmitter } from 'strict-typed-events';
import { ResponsiveMap } from '@opra/common';
import {
  FailedDependencyError, ForbiddenError,
  OpraException, ResourceNotFoundError, wrapException
} from '@opra/exception';
import { FallbackLng, I18n, LanguageResource, translate } from '@opra/i18n';
import {
  CollectionCountQuery, CollectionCreateQuery, CollectionDeleteManyQuery, CollectionDeleteQuery, CollectionGetQuery,
  CollectionResourceInfo, CollectionSearchQuery, CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  ComplexType,
  DataType, FieldGetQuery,
  OpraDocument,
  ResourceInfo, SingletonGetQuery,
  SingletonResourceInfo
} from '@opra/schema';
import { HttpHeaders } from '../enums/index.js';
import { IExecutionContext } from '../interfaces/execution-context.interface.js';
import { IResource } from '../interfaces/resource.interface.js';
import { createI18n } from '../utils/create-i18n.js';
import { MetadataResource } from './metadata-resource.js';
import { QueryContext } from './query-context.js';

export namespace OpraAdapter {
  export type UserContextResolver = (
      args: {
        executionContext: IExecutionContext;
        isBatch: boolean;
      }
  ) => object | Promise<object>;

  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    userContext?: UserContextResolver;
  }

  export interface I18nOptions {
    /**
     * Language to use
     * @default undefined
     */
    lng?: string;

    /**
     * Language to use if translations in user language are not available.
     * @default 'dev'
     */
    fallbackLng?: false | FallbackLng;

    /**
     * Default namespace used if not passed to translation function
     * @default 'translation'
     */
    defaultNS?: string;

    /**
     * Resources to initialize with
     * @default undefined
     */
    resources?: LanguageResource;

    /**
     * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
     * @default undefined
     */
    resourceDirs?: string[];
  }

}

export abstract class OpraAdapter<TExecutionContext extends IExecutionContext> {
  protected i18n: I18n;
  protected userContextResolver?: OpraAdapter.UserContextResolver;
  // protected _metadataResource: SingletonResourceInfo;
  protected _internalResources = new ResponsiveMap<string, ResourceInfo>();

  constructor(readonly document: OpraDocument) {

  }

  protected abstract prepareRequests(executionContext: TExecutionContext): QueryContext[];

  protected abstract sendResponse(executionContext: TExecutionContext, queryContexts: QueryContext[]): Promise<void>;

  protected abstract sendError(executionContext: TExecutionContext, error: OpraException): Promise<void>;

  protected abstract isBatch(executionContext: TExecutionContext): boolean;

  protected async handler(executionContext: TExecutionContext): Promise<void> {
    let queryContexts: QueryContext[] | undefined;
    let userContext: any;
    let failed = false;
    try {
      queryContexts = this.prepareRequests(executionContext);

      let stop = false;
      // Read requests can be executed simultaneously, write request should be executed one by one
      let promises: Promise<void>[] | undefined;
      let exclusive = false;
      for (const context of queryContexts) {
        exclusive = exclusive || context.query.operation !== 'read';

        // Wait previous read requests before executing update request
        if (exclusive && promises) {
          await Promise.allSettled(promises);
          promises = undefined;
        }

        // If previous request in bucket had an error and executed an update
        // we do not execute next requests
        if (stop) {
          context.errors.push(new FailedDependencyError());
          continue;
        }

        try {
          const promise = (async () => {
            // if (context.query.method === 'metadata') {
            //   await this._getSchemaExecute(context); //todo
            //   return;
            // }
            const resource = context.query.resource;
            await this._resourcePrepare(resource, context);
            if (this.userContextResolver && !userContext)
              userContext = this.userContextResolver({
                executionContext,
                isBatch: this.isBatch(executionContext)
              });
            context.userContext = userContext;
            await this._resourceExecute(this.document, resource, context);
          })().catch(e => {
            context.errors.push(e);
          });

          if (exclusive)
            await promise;
          else {
            promises = promises || [];
            promises.push(promise);
          }

          // todo execute sub property queries
        } catch (e: any) {
          context.errors.unshift(e);
        }

        if (context.errors.length) {
          // noinspection SuspiciousTypeOfGuard
          context.errors = context.errors.map(e => wrapException(e))
          if (exclusive)
            stop = stop || !!context.errors.find(
                e => !(e.issue.severity === 'warning' || e.issue.severity === 'info')
            );
        }
      }

      if (promises)
        await Promise.allSettled(promises);

      await this.sendResponse(executionContext, queryContexts);

    } catch (e: any) {
      failed = true;
      const error = wrapException(e);
      await this.sendError(executionContext, error);
    } finally {
      if (executionContext as unknown instanceof AsyncEventEmitter) {
        await (executionContext as unknown as AsyncEventEmitter)
            .emitAsyncSerial('finish', {
              userContext,
              failed
            }).catch();
      }
    }
  }

  protected async _resourcePrepare(resource: ResourceInfo, context: QueryContext) {
    const {query} = context;
    const fn = resource.metadata['pre_' + query.method];
    if (fn && typeof fn === 'function') {
      await fn(context);
    }
  }

  protected async _resourceExecute(document: OpraDocument, resource: ResourceInfo, context: QueryContext) {
    if (resource instanceof CollectionResourceInfo) {
      const {query} = context;
      if (query.kind === 'SearchCollectionQuery') {
        const promises: Promise<any>[] = [];
        let search: any;
        promises.push(
            this._collectionResourceExecute(document, resource, context)
                .then(v => search = v)
        );
        if (query.count && resource.metadata.count) {
          const ctx = {
            query: new CollectionCountQuery(query.resource, {filter: query.filter}),
            resultPath: ''
          } as QueryContext;
          Object.setPrototypeOf(ctx, context);
          promises.push(this._collectionResourceExecute(document, resource, ctx));
        }
        await Promise.all(promises);
        context.response = search;
        return;
      }
      context.response = await this._collectionResourceExecute(document, resource, context);
      return;
    } else if (resource instanceof SingletonResourceInfo) {
      context.response = await this._singletonResourceExecute(document, resource, context);
      return;
    }
    throw new Error(`Executing "${resource.kind}" has not been implemented yet`);
  }

  protected async _init(options?: OpraAdapter.Options) {
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

  protected async _collectionResourceExecute(document: OpraDocument, resource: CollectionResourceInfo, context: QueryContext) {
    const method = context.query.method;
    const resolverInfo = resource.metadata[method];
    if (!(resolverInfo && resolverInfo.handler))
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
        result = await resolverInfo.handler(context, query.data, query);
        result = Array.isArray(result) ? result[0] : result;
        if (result)
          context.status = 201;
        context.responseHeaders.set(HttpHeaders.X_Opra_DataType, resource.dataType.name);
        return result;
      }
      case 'count': {
        const query = context.query as CollectionCountQuery;
        result = await resolverInfo.handler(context, query);
        context.responseHeaders.set(HttpHeaders.X_Opra_Count, result);
        return result;
      }
      case 'get': {
        const query = context.query as CollectionGetQuery;
        result = await resolverInfo.handler(context, query.keyValue, query);
        result = Array.isArray(result) ? result[0] : result;
        if (!result)
          throw new ResourceNotFoundError(resource.name, query.keyValue);
        const v = await this._pathWalkThrough(query, query.dataType, result, resource.name);
        if (v.value === undefined)
          throw new ResourceNotFoundError(v.path);
        if (v.dataType)
          context.responseHeaders.set(HttpHeaders.X_Opra_DataType, v.dataType.name);
        return v.value;
      }
      case 'search': {
        const query = context.query as CollectionSearchQuery;
        result = await resolverInfo.handler(context, query);
        const items = Array.isArray(result) ? result : (context.response ? [result] : []);
        context.responseHeaders.set(HttpHeaders.X_Opra_DataType, resource.dataType.name);
        return items;
      }
      case 'update': {
        const query = context.query as CollectionUpdateQuery;
        result = await resolverInfo.handler(context, query.keyValue, query.data, query);
        result = Array.isArray(result) ? result[0] : result;
        if (!result)
          throw new ResourceNotFoundError(resource.name, query.keyValue);
        context.responseHeaders.set(HttpHeaders.X_Opra_DataType, resource.dataType.name);
        return result;
      }
      case 'delete':
      case 'deleteMany':
      case 'updateMany': {
        switch (method) {
          case 'delete': {
            const query = context.query as CollectionDeleteQuery;
            result = await resolverInfo.handler(context, query.keyValue, query);
            break;
          }
          case 'deleteMany': {
            const query = context.query as CollectionDeleteManyQuery;
            result = await resolverInfo.handler(context, query);
            break;
          }
          case 'updateMany': {
            const query = context.query as CollectionUpdateManyQuery;
            result = await resolverInfo.handler(context, query.data, query);
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

  protected async _singletonResourceExecute(document: OpraDocument, resource: SingletonResourceInfo, context: QueryContext) {
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
          context.responseHeaders.set(HttpHeaders.X_Opra_DataType, v.dataType.name);
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

    context.responseHeaders.set(HttpHeaders.X_Opra_DataType, resource.dataType.name)
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
