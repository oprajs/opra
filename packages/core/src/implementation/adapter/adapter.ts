import { FallbackLng, I18n, LanguageResource } from '@opra/i18n';
import { ApiException, FailedDependencyError } from '../../exception/index.js';
import { wrapError } from '../../exception/wrap-error.js';
import { ExecutionContext, ExecutionRequest } from '../execution-context.js';
import { OpraService } from '../opra-service.js';

export namespace OpraAdapter {
  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    userContext?: (request: any, options: { platform: string, isBatch: boolean }) => object | Promise<object>;
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

  export type UserContextResolver = (isBatch: boolean) => any | Promise<any>;

}

export abstract class OpraAdapter<TAdapterContext = any> {
  readonly i18n: I18n;

  constructor(readonly service: OpraService, i18n?: I18n) {
    this.i18n = i18n || I18n.defaultInstance;
  }

  protected abstract prepareRequests(adapterContext: TAdapterContext): ExecutionRequest[];

  protected abstract createExecutionContext(adapterContext: any, request: ExecutionRequest): ExecutionContext;

  protected abstract sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]): Promise<void>;

  protected abstract sendError(adapterContext: TAdapterContext, error: ApiException): Promise<void>;

  protected abstract isBatch(adapterContext: TAdapterContext): boolean;

  protected async handler(
      adapterContext: TAdapterContext,
      userContextResolver?: OpraAdapter.UserContextResolver
  ): Promise<void> {
    if (!this.i18n.isInitialized)
      await this.i18n.init();

    const executionContexts: ExecutionContext[] = [];
    let requests: ExecutionRequest[];
    let userContext: any;
    try {
      requests = this.prepareRequests(adapterContext);


      let stop = false;
      // Read requests can be executed simultaneously, write request should be executed one by one
      let promises: Promise<void>[] | undefined;
      let exclusive = false;
      for (const request of requests) {
        exclusive = exclusive || request.query.operationType !== 'read';

        // Wait previous read requests before executing update request
        if (exclusive && promises) {
          await Promise.allSettled(promises);
          promises = undefined;
        }

        const resource = request.query.resource;
        const context = this.createExecutionContext(adapterContext, request);
        executionContexts.push(context);

        // If previous request in bucket had an error and executed an update
        // we do not execute next requests
        if (stop) {
          context.response.errors.push(new FailedDependencyError());
          continue;
        }

        try {
          const promise = (async () => {
            await resource.prepare(context);
            if (userContextResolver && !userContext)
              userContext = userContextResolver(this.isBatch(adapterContext));
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

      if (userContext && typeof userContext.onRequestFinish === 'function') {
        try {
          const hasError = !!executionContexts.find(ctx => ctx.response.errors?.length);
          await userContext.onRequestFinish(hasError);
        } catch (e: any) {
          await this.sendError(adapterContext, wrapError(e));
          return;
        }
      }
      await this.sendResponse(adapterContext, executionContexts);

    } catch (e: any) {
      const error = wrapError(e);
      await this.sendError(adapterContext, error);
      return;
    }
  }

  protected static async initI18n(options?: OpraAdapter.Options): Promise<I18n> {
    if (options?.i18n instanceof I18n)
      return options.i18n;
    if (typeof options?.i18n === 'function')
      return options.i18n();
    const instance = I18n.createInstance(options?.i18n);
    await instance.init();
    return instance;
  }

}
