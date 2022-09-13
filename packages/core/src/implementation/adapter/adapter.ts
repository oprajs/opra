import { isPromise } from 'util/types';
import { I18n } from '@opra/i18n';
import { ApiException, FailedDependencyError, InternalServerError } from '../../exception/index.js';
import { ExecutionContext } from '../execution-context.js';
import { OpraService } from '../opra-service.js';

export namespace OpraAdapter {
  export interface Options {
    i18n?: I18n;
  }
}

export abstract class OpraAdapter<TAdapterContext = any, TOptions extends OpraAdapter.Options = OpraAdapter.Options> {
  i18n: I18n;

  constructor(readonly service: OpraService, options?: TOptions) {
    this.i18n = options?.i18n || I18n.defaultInstance;
  }

  protected abstract prepareExecutionContexts(adapterContext: TAdapterContext, userContext: any): ExecutionContext[];

  protected abstract sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]): Promise<void>;

  protected abstract sendError(adapterContext: TAdapterContext, error: ApiException): Promise<void>;

  protected async handler(adapterContext: TAdapterContext, userContext: any): Promise<void> {
    let executionContexts: ExecutionContext[];
    try {
      executionContexts = this.prepareExecutionContexts(adapterContext, userContext);
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
          await Promise.all(promises);
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
        response.errors.unshift(ApiException.wrap(e));
      }
      if (response.errors && response.errors.length) {
        // noinspection SuspiciousTypeOfGuard
        response.errors = response.errors.map(e => ApiException.wrap(e))
        if (exclusive)
          stop = stop || !!response.errors.find(
              e => !(e.response.severity === 'warning' || e.response.severity === 'info')
          );
      }
    }

    if (promises)
      await Promise.all(promises);

    await this.sendResponse(adapterContext, executionContexts);
  }

}
