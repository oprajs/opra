import type { Nullish } from 'ts-gems';
import type { ExecutionContext } from './execution-context.js';

export abstract class ServiceBase {
  declare protected _context: ExecutionContext;

  get context(): ExecutionContext {
    this._assertContext();
    return this._context;
  }

  for<C extends ExecutionContext, P extends Partial<this>>(
    context: C | ServiceBase,
    overwriteProperties?: Nullish<P>,
    overwriteContext?: Partial<C>,
  ): this & Required<P> {
    if (context instanceof ServiceBase) context = context.context as C;
    /** Create new context instance */
    const ctx = {} as ExecutionContext;
    Object.setPrototypeOf(ctx, context);
    if (overwriteContext) Object.assign(ctx, overwriteContext);
    /** Create new service instance */
    const instance = { _context: ctx } as unknown as ServiceBase;
    Object.setPrototypeOf(instance, this);
    if (overwriteProperties) Object.assign(instance, overwriteProperties);
    if (this[ServiceBase.extendSymbol]) this[ServiceBase.extendSymbol](instance);
    return instance as any;
  }

  protected _assertContext() {
    if (!this._context) throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
  }
}

export namespace ServiceBase {
  export const extendSymbol = Symbol('extend');
}
