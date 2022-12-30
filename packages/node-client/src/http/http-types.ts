/// <reference lib="dom" />
import { StrictOmit } from 'ts-gems';
import { URLSearchParams } from 'url';
import { ClientHttpHeaders, OpraDocument, OpraURLSearchParams } from '@opra/common';
import type { HttpResponse } from './http-response';

export type CommonHttpRequestOptions = {
  observe?: 'body' | 'response' // | 'events';
  http?: HttpRequestDefaults;
}

export type RawHttpRequest = StrictOmit<RequestInit, 'headers' | 'body' | 'method'> & {
  method: string;
  path: string;
  headers?: ClientHttpHeaders;
  params?: URLSearchParams | OpraURLSearchParams;
  body?: any;
};

export type HttpRequestDefaults = Pick<RawHttpRequest, 'headers' | 'params' |
    'mode' | 'credentials' | 'cache' | 'redirect' | 'referrer' | 'referrerPolicy' |
    'integrity' | 'keepalive' | 'signal'>;

export type HttpRequestHandler<TResult = any> = (req: RawHttpRequest) => Promise<HttpResponse<TResult>>;


export interface OpraHttpClientOptions {
  /**
   * Opra Service Metadata Document
   */
  document?: OpraDocument;

  // adapter?: OPCAdapter;
  defaults?: HttpRequestDefaults;
}
