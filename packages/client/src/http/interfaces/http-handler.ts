import { Observable } from 'rxjs';
import { HttpBackend } from '../http-backend.js';
import type { HttpEvent } from './http-event.js';

export type HttpHandlerFn<
  TRequest extends HttpBackend.RequestInit = HttpBackend.RequestInit,
> = (req: TRequest) => Observable<HttpEvent>;

export interface HttpHandler<
  TRequest extends HttpBackend.RequestInit = HttpBackend.RequestInit,
> {
  handle(req: TRequest): Observable<HttpEvent>;
}
