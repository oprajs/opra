import type { Nullish } from 'ts-gems';
import type { ExecutionContext } from './execution-context.js';

/**
 * Base class for services in the OPRA framework.
 * Provides access to the {@link ExecutionContext} and allows creating new
 * service instances with modified context or properties.
 */
export abstract class ServiceBase {
  declare protected _context?: ExecutionContext;

  /**
   * Initializes the service with optional configuration.
   *
   * @param options - Configuration options for the service.
   */
  constructor(options?: ServiceBase.Options) {
    this._context = options?.context;
  }

  /**
   * Returns the execution context associated with this service.
   *
   * @throws {@link Error} if no context is assigned to the service.
   * @returns The execution context.
   */
  get context(): ExecutionContext {
    this._assertContext();
    return this._context!;
  }

  /**
   * Creates a new instance of the service with a modified context or properties.
   *
   * @param context - The execution context or another service to inherit the context from.
   * @param overwriteProperties - Optional properties to overwrite in the new service instance.
   * @param overwriteContext - Optional context properties to overwrite in the new context.
   * @returns A new service instance with the specified modifications.
   */
  for<C extends ExecutionContext, P extends Partial<this>>(
    context: C | ServiceBase,
    overwriteProperties?: Nullish<P>,
    overwriteContext?: Partial<C>,
  ): this & Required<P> {
    if (context instanceof ServiceBase) context = context.context as C;
    /* Create a new context instance */
    const ctx = {} as ExecutionContext;
    Object.setPrototypeOf(ctx, context);
    if (overwriteContext) Object.assign(ctx, overwriteContext);
    /* Create a new service instance */
    const instance = { _context: ctx } as unknown as ServiceBase;
    Object.setPrototypeOf(instance, this);
    if (overwriteProperties) Object.assign(instance, overwriteProperties);
    if (this[ServiceBase.extendSymbol])
      this[ServiceBase.extendSymbol](instance);
    return instance as any;
  }

  /**
   * Asserts that a context is assigned to the service.
   *
   * @throws {@link Error} if no context is assigned.
   * @protected
   */
  protected _assertContext() {
    if (!this._context)
      throw new Error(
        `No context assigned for ${Object.getPrototypeOf(this).constructor.name}`,
      );
  }
}

/**
 * Namespace for {@link ServiceBase} related constants and interfaces.
 */
export namespace ServiceBase {
  /** Symbol used for extending service instances. */
  export const extendSymbol = Symbol('extend');

  /**
   * Configuration options for {@link ServiceBase}.
   */
  export interface Options {
    /** The execution context to be associated with the service. */
    context?: ExecutionContext;
  }
}
