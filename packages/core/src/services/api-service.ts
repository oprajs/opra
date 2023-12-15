import { RequestContext } from '../request-context.js';

export abstract class ApiService {
  protected _context: RequestContext;

  get context(): RequestContext {
    if (!this._context)
      throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  for(context: RequestContext | ApiService): this;
  for<O extends (ApiService.ExtendOptions & Partial<this>)>(context: RequestContext, attributes: O): this & O;
  for<O extends ApiService.ExtendOptions & Partial<this>>(attributes: O): this & O;
  for(arg0: any, attributes?: any): this {
    let instance: ApiService;
    if (RequestContext.is(arg0)) {
      instance = {_context: arg0} as unknown as ApiService;
    } else if (arg0 instanceof ApiService) {
      instance = {_context: arg0._context} as unknown as ApiService;
      for (const k of Object.keys(arg0)) {
        if (arg0.hasOwnProperty(k))
          instance[k] = arg0[k];
      }
    } else {
      instance = {} as ApiService;
    }
    Object.setPrototypeOf(instance, this);
    if (attributes)
      Object.assign(instance, attributes);
    const proto = Object.getPrototypeOf(instance);
    if (instance[ApiService.extendSymbol])
      proto[ApiService.extendSymbol](instance);
    return instance as this;
  }

}

export namespace ApiService {
  export interface ExtendOptions {
    [key: string | symbol]: any;
  }

  export const extendSymbol = Symbol('extend');
}
