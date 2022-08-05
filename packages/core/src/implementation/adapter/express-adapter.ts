import type { Application, Request, Response } from 'express';
import { normalizePath } from '@opra/url';
import type { OpraHttpAdapterOptions } from '../../interfaces/adapter-options.interface';
import type { HttpContext, HttpRequest, HttpResponse } from '../../interfaces/http-context.interface';
import type { OpraService } from '../opra-service';
import { OpraHttpAdapter } from './http-adapter';

export class OpraExpressAdapter extends OpraHttpAdapter<HttpContext> {
  static init(
      app: Application,
      service: OpraService,
      options?: OpraHttpAdapterOptions
  ): void {
    const adapter = new OpraExpressAdapter(service, options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    app.use(prefix, (request, response, next) => {
      const req = new ExpressRequestWrapper(request);
      const res = new ExpressResponseWrapper(response);
      const adapterContext: HttpContext = {
        getRequest: () => req,
        getResponse: () => res
      }
      adapter.processRequest(adapterContext)
          .catch(e => next(e));
    });
  }
}

class ExpressRequestWrapper implements HttpRequest {
  constructor(readonly instance: Request) {
  }

  get method(): string {
    return this.instance.method;
  }

  get url(): string {
    return this.instance.url;
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }
}


class ExpressResponseWrapper implements HttpResponse {
  constructor(readonly instance: Response) {
  }

  get statusCode(): number | undefined {
    return this.instance.statusCode;
  }

  setHeader(name: string, value: string): this {
    this.instance.setHeader(name, value);
    return this;
  }

  setStatus(value: number): this {
    // noinspection SuspiciousTypeOfGuard
    this.instance.status(typeof value === 'number'
        ? value
        : parseInt(value, 10) || 500);
    return this;
  }

  send(body: any): this {
    if (typeof body === 'string' || Buffer.isBuffer(body))
      this.instance.send(body);
    else this.instance.json(body);
    return this;
  }

  end(): this {
    this.instance.end();
    return this;
  }

}
