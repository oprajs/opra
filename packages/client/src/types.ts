// /// <reference lib="dom" />
import type { HttpRequest } from './impl/http-request';


/* **********************
 * Types
 *********************** */

export type RequestInterceptor = (request: HttpRequest) => void | Promise<void>;
export type ResponseInterceptor = (response: any) => void | Promise<void>;
export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;

