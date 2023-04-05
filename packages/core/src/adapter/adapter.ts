import path from 'path';
import { Task } from 'power-tasks';
import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ApiDocument,
  DocumentFactory,
  FailedDependencyError, getStackFileName,
  I18n,
  OpraException,
  OpraSchema,
  wrapException
} from '@opra/common';
import { ExecutionContext } from './interfaces/execution-context.interface.js';
import { I18nOptions } from './interfaces/i18n-options.interface.js';
import { ILogger } from './interfaces/logger.interface.js';
import { MetadataResource } from './internal/metadata.resource.js';
import { OpraQuery } from './query/index.js';
import { BatchRequestContext, QueryRequestContext, RequestContext } from './request-context/index.js';

const noOp = () => void 0;

export namespace OpraAdapter {
  export type UserContextResolver = (executionContext: ExecutionContext) => object | Promise<object>;

  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    userContext?: UserContextResolver;
    logger?: ILogger;
  }

}

export abstract class OpraAdapter<TExecutionContext extends ExecutionContext> {
  protected userContextResolver?: OpraAdapter.UserContextResolver;
  protected _internalDoc: ApiDocument;
  i18n: I18n;
  logger?: ILogger;

  protected constructor(readonly document: ApiDocument) {
  }

  /**
   * Initializes the adapter
   * @param options
   * @protected
   */
  protected async init(options?: OpraAdapter.Options) {
    this.logger = options?.logger;
    if (options?.i18n instanceof I18n)
      this.i18n = options.i18n;
    else if (typeof options?.i18n === 'function')
      this.i18n = await options.i18n();
    else this.i18n = await this._createI18n(options?.i18n);
    this.i18n = this.i18n || I18n.defaultInstance;
    if (!this.i18n.isInitialized)
      await this.i18n.init();

    this.userContextResolver = options?.userContext;

    this._internalDoc = await DocumentFactory.createDocument({
      version: OpraSchema.SpecVersion,
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Internal resources',
      },
      references: {'api': this.document},
      resources: [new MetadataResource(this.document)]
    });

    const promises: Promise<void>[] = [];
    for (const r of this.document.resources.values()) {
      const onInit = r.onInit;
      if (onInit)
        promises.push((async () => onInit.call(r.controller, r))());
    }
    await Promise.all(promises);
  }

  /**
   * Calls shutDown hook for all resources
   */
  async close() {
    const promises: Promise<void>[] = [];
    for (const r of this.document.resources.values()) {
      const onShutdown = r.onShutdown;
      if (onShutdown)
        promises.push((async () => onShutdown.call(r.controller, r))());
    }
    await Promise.allSettled(promises);
  }

  /**
   * Main request handler
   * @param executionContext
   * @protected
   */
  protected async handler(executionContext: TExecutionContext): Promise<void> {
    let requestContext: RequestContext | undefined;
    let failed = false;
    try {
      if (this.userContextResolver)
        executionContext.userContext = this.userContextResolver(executionContext);
      requestContext = await this.parse(executionContext);
      const task = this.generateRequestTask(executionContext, requestContext);
      await task.toPromise().catch(noOp);
      await this.sendResponse(executionContext, requestContext);
    } catch (e: any) {
      failed = true;
      const error = wrapException(e);
      await this.sendError(executionContext, error);
      this.logger?.error(e);
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

  protected generateRequestTask(
      executionContext: TExecutionContext,
      requestContext: RequestContext
  ): Task {
    if (requestContext instanceof BatchRequestContext) {
      const children = requestContext.queries
          .map(q => this.generateRequestTask(executionContext, q));
      return new Task(children, {bail: true});
    } else if (requestContext instanceof QueryRequestContext) {
      const {query} = requestContext;
      const task = new Task(
          async () => {
            const v = await OpraQuery.execute(query, requestContext);
            if (v != null)
              requestContext.response = v;
          },
          {
            id: requestContext.contentId,
            exclusive: query.operation !== 'read'
          });
      task.on('finish', () => {
        if (task.error) {
          if (task.failedDependencies)
            requestContext.errors.push(new FailedDependencyError());
          else
            requestContext.errors.push(wrapException(task.error));
          this.logger?.error(task.error);
          return;
        }
      });
      return task;
    }
    /* istanbul ignore next */
    throw new TypeError('Invalid request context instance');
  }


  protected async _createI18n(options?: I18nOptions): Promise<I18n> {
    const opts: I18nOptions = {
      ...options,
    }
    delete opts.resourceDirs;
    const instance = I18n.createInstance(opts);
    await instance.init();
    await instance.loadResourceDir(path.resolve(getStackFileName(), '../../../i18n'));
    if (options?.resourceDirs)
      for (const dir of options.resourceDirs)
        await instance.loadResourceDir(dir);
    return instance;
  }


  protected abstract parse(executionContext: TExecutionContext): Promise<RequestContext>;

  protected abstract sendResponse(executionContext: TExecutionContext, requestContext: RequestContext): Promise<void>;

  protected abstract sendError(executionContext: TExecutionContext, error: OpraException): Promise<void>;

}

