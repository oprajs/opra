import type { URLSearchParams } from 'url';
import type { ClientHttpHeaders } from '@opra/common';
import type { OPCBasicCredentials, OPCProxyConfig } from '../types.js';

export type HttpRequestOptions = {
  headers?: ClientHttpHeaders;
  params?: Record<string, string | string[]> | URLSearchParams;
  auth?: OPCBasicCredentials;
  timeout?: number;
  timeoutErrorMessage?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxRedirects?: number;
  maxUploadRate?: number
  maxDownloadRate?: number;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: OPCProxyConfig | false;
  validateStatus?: ((status: number) => boolean) | null;
}
