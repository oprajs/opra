import { Source } from '@opra/common';
import { HttpServerRequest } from './http/http-server-request.js';

export interface Request {
  source: Source;
  endpoint: string;
  contentId?: string;
  params?: Record<string, any>;

  switchToHttp(): HttpServerRequest;

  switchToWs(): never;

  switchToRpc(): never;
}
