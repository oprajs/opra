import { Nullish } from 'ts-gems';
import { RequestContext } from '../request-context.js';

export abstract class ApiService {
  protected _context: RequestContext;

  get context(): RequestContext {
    if (!this._context)
      throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  for<C extends RequestContext, P extends Partial<this>>(
      context: C,
      overwriteProperties?: Nullish<P>,
      overwriteContext?: Partial<C>
  ): this & Required<P> {
    // Create new context instance
    const ctx = {} as RequestContext;
    Object.setPrototypeOf(ctx, context);
    if (overwriteContext)
      Object.assign(ctx, overwriteContext);
    // Create new service instance
    const instance = {_context: ctx} as unknown as ApiService;
    Object.setPrototypeOf(instance, this);
    if (overwriteProperties)
      Object.assign(instance, overwriteProperties);
    if (this[ApiService.extendSymbol])
      this[ApiService.extendSymbol](instance);
    return instance as any;
  }

}

export namespace ApiService {

  export const extendSymbol = Symbol('extend');
}
