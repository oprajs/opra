import { isPromise } from 'util/types';
import { I18n } from '@opra/i18n';
import { ApiException, FailedDependencyError } from '../../exception';
import { ExecutionContext } from '../../interfaces/execution-context.interface';
import type { OpraService } from '../opra-service';

export namespace OpraAdapter {
  export interface Options {
    i18n?: I18n;
  }
}

export abstract class OpraAdapter<TAdapterContext = any, TOptions extends OpraAdapter.Options = OpraAdapter.Options> {
  i18n: I18n;

  protected constructor(readonly service: OpraService, options?: TOptions) {
    this.i18n = options?.i18n || I18n.defaultInstance;
  }

  protected abstract prepareExecutionContexts(adapterContext: TAdapterContext): ExecutionContext[];

  protected abstract sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]): Promise<void>;

  protected async handler(adapterContext: TAdapterContext): Promise<void> {
    const executionContexts = this.prepareExecutionContexts(adapterContext);
    let stop = false;
    // Read requests can be executed simultaneously, write request should be executed one by one
    let promises: Promise<void>[] | undefined;
    let exclusive = false;
    for (const ctx of executionContexts) {
      const request = ctx.request;
      const response = ctx.response;
      exclusive = exclusive || request.query.operationMethod !== 'read';
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
          const v = ctx.resource.execute(ctx);
          if (!exclusive) {
            if (isPromise(v)) {
              promises = promises || [];
              promises.push(v);
            }
          }
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
