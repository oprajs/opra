import type { Application, Request, Response } from 'express';
import { normalizePath } from '@opra/url';
import type { HttpAdapterContext, HttpRequest, HttpResponse } from '../../interfaces/http-context.interface.js';
import type { OpraService } from '../opra-service.js';
import { OpraHttpAdapter } from './http-adapter.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
    userContext?: (request: Request) => object | Promise<object>;
  }

}

export class OpraExpressAdapter extends OpraHttpAdapter<HttpAdapterContext, OpraExpressAdapter.Options> {

  static init(
      app: Application,
      service: OpraService,
      options?: OpraExpressAdapter.Options
  ): void {
    const adapter = new OpraExpressAdapter(service, options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    const userContextResolver = options?.userContext;
    app.use(prefix, (request, response, next) => {
      (async () => {
        const userContext = userContextResolver && await userContextResolver(request);
        const req = new ExpressRequestWrapper(request);
        const res = new ExpressResponseWrapper(response);
        const adapterContext: HttpAdapterContext = {
          getRequest: () => req,
          getResponse: () => res,
          getUserContext: () => userContext
        }
        await adapter.handler(adapterContext);
      })().catch(e => next(e));
    });
  }

}

class ExpressRequestWrapper implements HttpRequest {
  constructor(readonly instance: Request) {
  }

  getMethod(): string {
    return this.instance.method;
  }

  getUrl(): string {
    return this.instance.url;
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }

  getHeaderNames(): string[] {
    return this.instance.rawHeaders;
  }

  getHeaders(): Record<string, any> {
    return this.instance.headers;
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
