import { isPromise } from 'util/types';
import { FallbackLng, I18n, LanguageResource } from '@opra/i18n';
import { ApiException, FailedDependencyError, InternalServerError } from '../../exception/index.js';
import { ExecutionContext } from '../execution-context.js';
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

  protected abstract prepareExecutionContexts(
      adapterContext: TAdapterContext,
      userContextResolver?: OpraAdapter.UserContextResolver
  ): ExecutionContext[];

  protected abstract sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]): Promise<void>;

  protected abstract sendError(adapterContext: TAdapterContext, error: ApiException): Promise<void>;

  protected abstract isBatch(adapterContext: TAdapterContext): boolean;

  protected async handler(
      adapterContext: TAdapterContext,
      userContextResolver?: OpraAdapter.UserContextResolver
  ): Promise<void> {
    if (!this.i18n.isInitialized)
      await this.i18n.init();

    let executionContexts: ExecutionContext[];
    let userContext: any;
    try {
      executionContexts = this.prepareExecutionContexts(adapterContext, userContextResolver);
    } catch (e: any) {
      const error = InternalServerError.wrap(e);
      await this.sendError(adapterContext, error);
      return;
    }

    let stop = false;
    // Read requests can be executed simultaneously, write request should be executed one by one
    let promises: Promise<void>[] | undefined;
    let exclusive = false;
    for (const ctx of executionContexts) {
      const request = ctx.request;
      const response = ctx.response;
      exclusive = exclusive || request.query.operationType !== 'read';
      try {
        // Wait previous read requests before executing update request
        if (exclusive && promises) {
          await Promise.allSettled(promises);
          promises = undefined;
        }
        // If previous request in bucket had an error and executed an update
        // we do not execute next requests
        if (stop) {
          response.errors.push(new FailedDependencyError());
        } else {
          const resource = ctx.request.query.resource;
          const v = resource.execute(ctx);
          if (isPromise(v)) {
            v.catch(e => {
              ctx.response.errors.push(InternalServerError.wrap(e));
            })
            if (exclusive)
              await v;
            else {
              promises = promises || [];
              promises.push(v);
            }
          }
          // todo execute sub property queries
        }
      } catch (e: any) {
        response.errors.unshift(InternalServerError.wrap(e));
      }
      if (response.errors && response.errors.length) {
        // noinspection SuspiciousTypeOfGuard
        response.errors = response.errors.map(e => InternalServerError.wrap(e))
        if (exclusive)
          stop = stop || !!response.errors.find(
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
        await this.sendError(adapterContext, InternalServerError.wrap(e));
        return;
      }
    }

    await this.sendResponse(adapterContext, executionContexts);
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
