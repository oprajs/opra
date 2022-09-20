import type { Application, Request, Response } from 'express';
import { AsyncEventEmitter } from 'strict-typed-events';
import { normalizePath } from '@opra/url';
import type {
  ContextType,
  IHttpExecutionContext,
  IHttpRequestWrapper,
  IHttpResponseWrapper, PlatformType
} from '../../interfaces/execution-context.interface';
import type { OpraService } from '../opra-service.js';
import { OpraHttpAdapter } from './http-adapter.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapter<IHttpExecutionContext> {

  static async init(
      app: Application,
      service: OpraService,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const i18n = await this.initI18n(options);
    const adapter = new OpraExpressAdapter(service, {
      ...options,
      i18n
    });
    const prefix = '/' + normalizePath(options?.prefix, true);
    app.use(prefix, (request, response, next) => {
      (async () => {
        const executionContext = new ExpressExecutionContext(request, response);
        await adapter.handler(executionContext);
      })().catch(e => next(e));
    });
    return adapter;
  }

}

class ExpressExecutionContext extends AsyncEventEmitter implements IHttpExecutionContext {
  private readonly _request: IHttpRequestWrapper;
  private readonly _response: IHttpResponseWrapper;

  constructor(request: Request, response: Response) {
    super();
    this._request = new ExpressRequestWrapper(request);
    this._response = new ExpressResponseWrapper(response);
  }

  getType(): ContextType {
    return 'http';
  }

  getPlatform(): PlatformType {
    return 'express'
  }

  switchToHttp(): IHttpExecutionContext {
    return this;
  }

  getRequest(): any {
    return this._request.getInstance();
  }

  getResponse(): any {
    return this._response.getInstance();
  }

  getRequestWrapper(): IHttpRequestWrapper {
    return this._request;
  }

  getResponseWrapper(): IHttpResponseWrapper {
    return this._response;
  }

  onFinish(fn: (...args: any[]) => (void | Promise<void>)) {
    this.on('finish', fn);
  }

}

class ExpressRequestWrapper implements IHttpRequestWrapper {
  constructor(readonly instance: Request) {
  }

  getInstance(): any {
    return this.instance;
  }

  getMethod(): string {
    return this.instance.method;
  }

  getUrl(): string {
    return this.instance.url;
  }

  getHeaderNames(): string[] {
    return Object.keys(this.instance.headers);
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }

  getHeaders(): Record<string, any> {
    return this.instance.headers;
  }

  getBody(): any {
    return this.instance.body;
  }

}


class ExpressResponseWrapper implements IHttpResponseWrapper {
  constructor(readonly instance: Response) {
  }

  getInstance(): any {
    return this.instance;
  }

  getHeaderNames(): string[] {
    return this.instance.getHeaderNames();
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }

  setHeader(name: string, value: string): this {
    this.instance.setHeader(name, value);
    return this;
  }

  getStatus(): number | undefined {
    return this.instance.statusCode;
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
