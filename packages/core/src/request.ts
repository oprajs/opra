import { ApiAction, ApiOperation, Resource } from '@opra/common';
import { HttpServerRequest } from './http/http-server-request.js';

export interface Request {
  resource: Resource;
  endpoint: ApiAction | ApiOperation;
  key?: any;
  controller: Object;
  handler: Function;
  contentId?: string;
  params: Record<string, any>;

  switchToHttp(): HttpServerRequest;

  switchToWs(): never;

  switchToRpc(): never;
}
