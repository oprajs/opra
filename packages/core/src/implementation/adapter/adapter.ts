import { AsyncEventEmitter } from 'strict-typed-events';
import { FallbackLng, I18n, LanguageResource } from '@opra/i18n';
import { ApiException, FailedDependencyError } from '../../exception/index.js';
import { wrapError } from '../../exception/wrap-error.js';
import { IExecutionContext } from '../../interfaces/execution-context.interface.js';
import { createI18n } from '../../utils/create-i18n.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';

export namespace OpraAdapter {
  export type UserContextResolver = (
      args: {
        executionContext: IExecutionContext;
        isBatch: boolean;
      }
  ) => object | Promise<object>;
  export type RequestFinishEvent = (args: {
    executionContext: IExecutionContext;
    userContext?: any;
    failed: boolean;
  }) => Promise<void>;

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
  readonly i18n: I18n;
  readonly userContextResolver?: OpraAdapter.UserContextResolver;

  constructor(readonly service: OpraService, options?: Omit<OpraAdapter.Options, 'i18n'> & { i18n: I18n }) {
    this.i18n = options?.i18n || I18n.defaultInstance;
    this.userContextResolver = options?.userContext;
  }

  protected abstract prepareRequests(executionContext: TExecutionContext): QueryContext[];

  protected abstract sendResponse(executionContext: TExecutionContext, queryContexts: QueryContext[]): Promise<void>;

  protected abstract sendError(executionContext: TExecutionContext, error: ApiException): Promise<void>;

  protected abstract isBatch(executionContext: TExecutionContext): boolean;

  protected async handler(executionContext: TExecutionContext): Promise<void> {
    if (!this.i18n.isInitialized)
      await this.i18n.init();

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
        exclusive = exclusive || context.query.operationType !== 'read';

        // Wait previous read requests before executing update request
        if (exclusive && promises) {
          await Promise.allSettled(promises);
          promises = undefined;
        }

        // If previous request in bucket had an error and executed an update
        // we do not execute next requests
        if (stop) {
          context.response.errors.push(new FailedDependencyError());
          continue;
        }

        try {
          const resource = context.query.resource;
          const promise = (async () => {
            await resource.prepare(context);
            if (this.userContextResolver && !userContext)
              userContext = this.userContextResolver({
                executionContext,
                isBatch: this.isBatch(executionContext)
              });
            context.userContext = userContext;
            await resource.execute(context);
          })().catch(e => {
            context.response.errors.push(e);
          });

          if (exclusive)
            await promise;
          else {
            promises = promises || [];
            promises.push(promise);
          }

          // todo execute sub property queries
        } catch (e: any) {
          context.response.errors.unshift(e);
        }

        if (context.response.errors.length) {
          // noinspection SuspiciousTypeOfGuard
          context.response.errors = context.response.errors.map(e => wrapError(e))
          if (exclusive)
            stop = stop || !!context.response.errors.find(
                e => !(e.response.severity === 'warning' || e.response.severity === 'info')
            );
        }
      }

      if (promises)
        await Promise.allSettled(promises);

      await this.sendResponse(executionContext, queryContexts);

    } catch (e: any) {
      failed = true;
      const error = wrapError(e);
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

  protected static async initI18n(options?: OpraAdapter.Options): Promise<I18n> {
    if (options?.i18n instanceof I18n)
      return options.i18n;
    if (typeof options?.i18n === 'function')
      return options.i18n();
    return createI18n(options?.i18n);
  }

}
