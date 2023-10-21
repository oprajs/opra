import { Observable } from 'rxjs';
import { HttpBackend } from './http-backend.js';
import { HttpEvent } from './interfaces/http-event.js';
import { HttpHandler, HttpHandlerFn } from './interfaces/http-handler.js';
import { HttpInterceptor } from './interfaces/http-interceptor.js';

type InterceptorChain<TRequest extends HttpBackend.RequestInit> =
    (req: TRequest, nextFn: HttpHandlerFn<TRequest>) => Observable<HttpEvent>;

export class HttpInterceptorHandler<TRequest extends HttpBackend.RequestInit> implements HttpHandler<TRequest> {
  private readonly chain: InterceptorChain<TRequest>;
  private readonly finalHandler: HttpHandler;

  constructor(interceptors: HttpInterceptor[], finalHandler: HttpHandler) {
    this.chain = interceptors.reduceRight<InterceptorChain<TRequest>>(
        (chainTailFn, interceptor) =>
            (initialRequest, handler) =>
                interceptor.intercept(initialRequest,
                    {
                      handle: (downstreamRequest) => chainTailFn(downstreamRequest, handler)
                    } as HttpHandler<TRequest>
                ),
        chainEnd
    );
    this.finalHandler = finalHandler;
  }

  handle(initialRequest: TRequest): Observable<HttpEvent> {
    return this.chain(initialRequest, (req) => this.finalHandler.handle(req));
  }
}

function chainEnd(req: any, handler: HttpHandlerFn<any>) {
  return handler(req);
}
