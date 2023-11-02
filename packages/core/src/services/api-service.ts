import { RequestContext } from '../request-context.js';

export abstract class ApiService {
  protected _context: RequestContext;

  get context(): RequestContext {
    if (!this._context)
      throw new Error(`No context assigned for ${Object.getPrototypeOf(this).constructor.name}`);
    return this._context;
  }

  forContext(context: RequestContext): typeof this {
    const instance = {context} as ApiService;
    Object.setPrototypeOf(instance, this);
    return instance as typeof this;
  }
}
