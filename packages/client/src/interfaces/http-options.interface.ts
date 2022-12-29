import type { URLSearchParams } from 'url';
import type { ClientHttpHeaders } from '@opra/common';

export type HttpRequestOptions = {
  headers?: ClientHttpHeaders;
  params?: Record<string, string | string[]> | URLSearchParams;
  timeout?: number;
  timeoutErrorMessage?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxRedirects?: number;
  maxUploadRate?: number
  maxDownloadRate?: number;
  httpAgent?: any;
  httpsAgent?: any;
  validateStatus?: ((status: number) => boolean) | null;
}
