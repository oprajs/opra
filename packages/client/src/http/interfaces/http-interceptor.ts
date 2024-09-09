import { Observable } from 'rxjs';
import { HttpBackend } from '../http-backend.js';
import type { HttpEvent } from './http-event.js';
import type { HttpHandler, HttpHandlerFn } from './http-handler.js';

export type HttpInterceptorFn<TRequest extends HttpBackend.RequestInit = HttpBackend.RequestInit> = (
  req: TRequest,
  next: HttpHandlerFn<TRequest>,
) => Observable<HttpEvent<unknown>>;

export interface HttpInterceptor<TRequest extends HttpBackend.RequestInit = HttpBackend.RequestInit> {
  intercept(req: TRequest, next: HttpHandler<TRequest>): Observable<HttpEvent>;
}
