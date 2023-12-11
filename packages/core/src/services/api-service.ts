import { RequestContext } from '../request-context.js';

const cachedServices = Symbol('cachedServices');

export namespace ApiService {
  export interface ExtendOptions {
    [key: string | symbol]: any;
  }
}

export abstract class ApiService {
  protected _context: RequestContext;

  get context(): RequestContext {
    if (!this._context)
      throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  for(context: RequestContext | ApiService): this;
  for<O extends (ApiService.ExtendOptions & Partial<this>)>(context: RequestContext | ApiService, attributes: O): this & O;
  for<O extends ApiService.ExtendOptions & Partial<this>>(attributes: O): this & O;
  for(arg0: any, attributes?: any): this {
    let context = this._context;
    if (RequestContext.is(arg0))
      context = arg0;
    else if (arg0 instanceof ApiService) {
      context = arg0.context;
    } else attributes = attributes || arg0;

    // Create cache map and instance array
    const cacheMap = context[cachedServices] = context[cachedServices] || new WeakMap();
    const ctor = Object.getPrototypeOf(this).constructor;
    const cachedInstances: ApiService[] = cacheMap.get(ctor) || [];
    cacheMap.set(ctor, cachedInstances);
    // Find cached instance that matches given arguments
    let instance = cachedInstances.find(
        (service) => this._instanceCompare(service, context, attributes)
    );
    if (instance)
      return instance as this;
    // Create new instance
    instance = {context} as ApiService;
    if (attributes)
      Object.assign(instance, attributes);
    Object.setPrototypeOf(instance, this);
    cachedInstances.push(instance);
    return instance as this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _instanceCompare(service: ApiService, context: RequestContext, attributes?: Object): boolean {
    if (attributes && Object.keys(attributes).find(k => attributes[k] !== service[k]))
      return false;
    return service.context === context;
  }

}
