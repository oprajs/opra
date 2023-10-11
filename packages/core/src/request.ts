import { Action, Operation, Resource } from '@opra/common';
import { HttpServerRequest } from './http/http-server-request.js';

export interface Request {
  resource: Resource;
  endpoint: Action | Operation;
  key?: any;
  controller: Object;
  handler: Function;
  contentId?: string;
  params: Record<string, any>;

  switchToHttp(): HttpServerRequest;

  switchToWs(): never;

  switchToRpc(): never;
}
