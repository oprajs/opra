import type {Application, Request, Response} from 'express';
import {OpraServiceDef} from '@opra/common';
import {normalizePath} from '@opra/url';
import {OpraAdapterOptions} from '../interfaces/adapter-options.interface';
import {HttpRequest} from '../interfaces/http-request.interface';
import {HttpResponse} from '../interfaces/http-response.interface';
import { HttpExecutionContext, OpraHttpAdapter } from './http-adapter';

export class OpraExpressAdapter extends OpraHttpAdapter<HttpExecutionContext> {
  readonly app: Application;

  static async create(app: Application, config: OpraServiceDef, options?: OpraAdapterOptions): Promise<OpraExpressAdapter> {
    const instance = new OpraExpressAdapter(config, options);
    const prefix = '/' + normalizePath(config.prefix, true);
    app.use(prefix, (request, response, next) => {
      const context: HttpExecutionContext = {
        request: new ExpressRequestWrapper(request),
        response: new ExpressResponseWrapper(response)
      }
      instance.processRequest(context)
        .catch(e => next(e));
    });
    return instance;
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
