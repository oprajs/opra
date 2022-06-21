import {
  ApiException,
  isCollectionResourceDef,
  OpraBaseResourceDef,
  OpraQueryNode, OpraResolverFunction,
  OpraServiceDef,
  OpraServiceHost
} from '@opra/common';
import { I18n } from '@opra/i18n';
import { OpraAdapterOptions } from '../interfaces';

export abstract class OpraAdapter<TContext = any> {
  serviceHost: OpraServiceHost;
  resources: Map<string, OpraBaseResourceDef> = new Map<string, OpraBaseResourceDef>();
  i18n: I18n;

  protected constructor(readonly serviceConfig: OpraServiceDef, options?: OpraAdapterOptions) {
    this.i18n = options?.i18n || I18n.defaultInstance;
    Object.entries(serviceConfig.resources)
        .map(([name, res]) => this.resources.set(name, res));
  }

  protected abstract buildQuery(context: TContext): OpraQueryNode;

  protected abstract sendResponse(context: TContext, query: OpraQueryNode): Promise<void>;

  protected async processRequest(context: TContext): Promise<void> {
    const query = this.buildQuery(context);
    try {
      const data = await this.executeQuery(context, query);
      if (data)
        query.returnValue = data;
    } catch (e) {
      query.errors = query.errors || [];
      query.errors.unshift(e);
    }
    if (query.errors)
      query.errors = this.transformErrors(context, query.errors);
    await this.sendResponse(context, query);
  }

  protected async executeQuery(context: TContext, query: OpraQueryNode): Promise<any> {
    const resourceDef = this.resources.get(query.resourceName);
    if (isCollectionResourceDef(resourceDef)) {
      let resolver: OpraResolverFunction | undefined;
      if (query.intent === 'collection' && query.operation === 'read') {
        const opDef = resourceDef.operations.list;
        if (opDef)
          resolver = opDef.resolver;
      } else if (query.intent === 'instance' && query.operation === 'read') {
        const opDef = resourceDef.operations.read;
        if (opDef)
          resolver = opDef.resolver;
      }
      if (resolver)
        return await resolver(query);
    }
  }

  protected transformErrors(context: TContext, error: any): ApiException[] {
    const errors = Array.isArray(error) ? error : [error];
    return errors.map((arr, err) => {
      const e = this.transformError(context, err);
      if (e) arr.push(e);
      return arr;
    }, []);
  }

  protected transformError(context: TContext, error: any): ApiException {
    return error instanceof ApiException ? error : new ApiException(error);
  }

}
