import { I18n } from '@opra/i18n';
import { ApiException } from '../../exceptions';
import type { OpraAdapterOptions } from '../../interfaces/adapter';
import type { ExecutionContext } from '../../interfaces/execution-context.interface';
import type { OpraService } from '../opra-service';

export abstract class OpraAdapter<TAdapterContext = any> {
  i18n: I18n;

  protected constructor(readonly service: OpraService, options?: OpraAdapterOptions) {
    this.i18n = options?.i18n || I18n.defaultInstance;
  }

  protected abstract buildExecutionContext(adapterContext: TAdapterContext): ExecutionContext;

  protected abstract sendResponse(adapterContext: TAdapterContext, executionContext: ExecutionContext): Promise<void>;

  protected async processRequest(adapterContext: TAdapterContext): Promise<void> {
    const executionContext = this.buildExecutionContext(adapterContext);
    try {
      const data = await this.executeQuery(adapterContext, executionContext);
      if (data != null)
        executionContext.response.value = data;
      else if (!executionContext.query.keyValues) executionContext.response.value = [];
    } catch (e) {
      executionContext.errors = executionContext.errors || [];
      executionContext.errors.unshift(e);
    }
    if (executionContext.errors)
      executionContext.errors = this.transformErrors(adapterContext, executionContext.errors);
    await this.sendResponse(adapterContext, executionContext);
  }

  protected async executeQuery(adapterContext: TAdapterContext, executionContext: ExecutionContext): Promise<any> {
    /*
    const resourceDef = this.service.getResource(executionContext.request.resourceName);
    if (isCollectionResourceDef(resourceDef)) {
      const opDef: OpraBaseOperationDefinition = resourceDef.operations[executionContext.request.operation];
      if (opDef.resolver)
        return await opDef.resolver(executionContext);
    }*/
  }

  protected transformErrors(adapterContext: TAdapterContext, error: any): ApiException[] {
    const errors = Array.isArray(error) ? error : [error];
    return errors.reduce((arr, err) => {
      const e = this.transformError(adapterContext, err);
      if (e) arr.push(e);
      return arr;
    }, []);
  }

  protected transformError(adapterContext: TAdapterContext, error: any): ApiException {
    return error instanceof ApiException ? error : new ApiException(error);
  }

}
