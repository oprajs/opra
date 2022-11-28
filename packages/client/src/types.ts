import {
  AxiosAdapter,
  AxiosBasicCredentials,
  AxiosProxyConfig,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import { ResponsiveMap } from '@opra/common';

export { PartialInput, PartialOutput } from '@opra/common';

export { AxiosRequestConfig, AxiosResponse, AxiosProxyConfig, AxiosBasicCredentials }
export type ClientAdapter = AxiosAdapter;

export type ResponseHeaders = Partial<Record<string, string | string[]>>;
export type MaxUploadRate = number;
export type MaxDownloadRate = number;

export type HttpRequestOptions = {
  auth?: AxiosBasicCredentials;
  headers?: Record<string, string>;
  timeout?: number;
  timeoutErrorMessage?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxRedirects?: number;
  maxRate?: number | [MaxUploadRate, MaxDownloadRate];
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: AxiosProxyConfig | false;
  validateStatus?: ((status: number) => boolean) | null;
}

export type CommonQueryOptions = {
  http?: HttpRequestOptions
}


export type ClientResponse<T = any> = {
  status: number;
  statusText: string;
  rawHeaders: ResponseHeaders;
  headers: ResponsiveMap<string, string | string[]>;
  data?: T;
};


export type BatchClientResponse = (ClientResponse & { id: string })[];


export interface OpraBatchRequestOptions {

}
