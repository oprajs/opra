import type { Nullish } from 'ts-gems';
import type { ExecutionContext } from './execution-context.js';

export abstract class ServiceBase {
  protected declare _context: ExecutionContext;

  get context(): ExecutionContext {
    if (!this._context) throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  for<C extends ExecutionContext, P extends Partial<this>>(
    context: C,
    overwriteProperties?: Nullish<P>,
    overwriteContext?: Partial<C>,
  ): this & Required<P> {
    // Create new context instance
    const ctx = {} as ExecutionContext;
    Object.setPrototypeOf(ctx, context);
    if (overwriteContext) Object.assign(ctx, overwriteContext);
    // Create new service instance
    const instance = { _context: ctx } as unknown as ServiceBase;
    Object.setPrototypeOf(instance, this);
    if (overwriteProperties) Object.assign(instance, overwriteProperties);
    if (this[ServiceBase.extendSymbol]) this[ServiceBase.extendSymbol](instance);
    return instance as any;
  }
}

export namespace ServiceBase {
  export const extendSymbol = Symbol('extend');
}
