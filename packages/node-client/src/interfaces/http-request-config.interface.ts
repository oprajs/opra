import type { URLSearchParams } from 'url';
import type { ClientHttpHeaders } from '@opra/common';
import type { HttpRequestOptions } from './http-options.interface.js';

export type HttpRequestConfig = {
  method: string;
  url: string;
  headers?: ClientHttpHeaders;
  params?: Record<string, string | string[]> | URLSearchParams;
  body?: any;
  auth?: any; // todo
  timeout?: number;
  timeoutErrorMessage?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxRedirects?: number;
  maxUploadRate?: number
  maxDownloadRate?: number;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: any | false; // todo
  validateStatus?: ((status: number) => boolean) | null;
} & HttpRequestOptions;
