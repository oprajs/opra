// /// <reference lib="dom" />
import type { Observable } from 'rxjs';
import type { HttpObserveType } from './enums/http-observable-type.enum.js';
import type { HttpRequest } from './impl/http-request';


/* **********************
 * Types
 *********************** */

export type HttpRequestHandler = (observe: HttpObserveType, request: HttpRequest) => Observable<any>;
export type RequestInterceptor = (request: HttpRequest) => void | Promise<void>;
export type ResponseInterceptor = (response: any) => void | Promise<void>;
export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;

