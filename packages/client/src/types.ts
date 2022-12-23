import { AxiosAdapter, AxiosBasicCredentials, AxiosProxyConfig } from 'axios';
import { StrictOmit } from 'ts-gems';
import { HttpRequestConfig } from './interfaces/http-request-config.interface.js';

export type OPCAdapter = AxiosAdapter;
export type OPCProxyConfig = AxiosProxyConfig;
export type OPCBasicCredentials = AxiosBasicCredentials;
export type OPCHttpOptions = StrictOmit<HttpRequestConfig, 'method' | 'url' | 'body'>;

