import { AxiosRequestConfig } from 'axios';
import { OpraDocument } from '@opra/schema';
import type { OpraClient } from '../client.js';
import { OpraResponse } from '../response.js';
import { CommonRequestOptions } from '../types.js';

export interface Context<T, TResponse extends OpraResponse<T>> {
  serviceUrl: string;
  client: OpraClient;
  document: OpraDocument;
  handler: (req: AxiosRequestConfig, options: CommonRequestOptions) => Promise<TResponse>;
}
