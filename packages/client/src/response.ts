import { ResponsiveMap } from '@opra/common';
import { ResponseHeaders } from './types.js';

export type OpraResponse<T = any> = {
  status: number;
  statusText: string;
  rawHeaders: ResponseHeaders;
  headers: ResponsiveMap<string, string | string[]>;
  data?: T;
};
