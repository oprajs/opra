import { RequestContext } from '../request-context.js';

const cachedServices = Symbol('cachedServices');

export abstract class ApiService {
  protected _context: RequestContext;

  get context(): RequestContext {
    if (!this._context)
      throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  forContext(source: ApiService): this
  forContext(context: RequestContext, attributes?: any): this
  forContext(arg0: RequestContext | ApiService, attributes?: any): this {
    let context: RequestContext;
    if (arg0 instanceof ApiService) {
      context = arg0.context;
      attributes = arg0;
    } else context = arg0;
    const cacheMap = context[cachedServices] = context[cachedServices] || new WeakMap();
    const ctor = Object.getPrototypeOf(this).constructor;
    const cachedInstances: ApiService[] = cacheMap.get(ctor) || [];
    cacheMap.set(ctor, cachedInstances);
    const newInstance = !this._context || this._context !== context;
    if (!newInstance) {
      const instance = cachedInstances
          .find(service => this._cacheMatch(service, context, attributes));
      if (instance)
        return instance as this;
    }
    const instance = {context} as ApiService;
    Object.setPrototypeOf(instance, this);
    cachedInstances.push(instance);
    return instance as this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _cacheMatch(service: ApiService, context: RequestContext, attributes?: any): boolean {
    return service.context === context;
  }

}
