// /// <reference lib="dom" />
import type { HttpRequest } from './impl/http-request';
import type { HttpResponse } from './impl/http-response.js';


/* **********************
 * Types
 *********************** */

export type RequestInterceptor = (request: HttpRequest) => void | Promise<void>;
export type ResponseInterceptor = (response: HttpResponse, request: HttpRequest) => void | Promise<void>;
export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;

