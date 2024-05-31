import { HttpController, HttpMediaType, HttpOperation } from '@opra/common';
import type { ExecutionContext } from '../../base/interfaces/execution-context.interface';
import { MultipartReader } from '../multipart-reader.js';
import type { HttpIncoming } from './http-incoming.interface.js';
import type { HttpOutgoing } from './http-outgoing.interface.js';

export interface HttpContext extends ExecutionContext {
  readonly resource: HttpController;
  readonly operation: HttpOperation;
  readonly request: HttpIncoming;
  readonly response: HttpOutgoing;
  readonly cookies: Record<string, any>;
  readonly headers: Record<string, any>;
  readonly pathParams: Record<string, any>;
  readonly queryParams: Record<string, any>;
  readonly isMultipart: boolean;
  readonly mediaType?: HttpMediaType;

  getBody<T>(): Promise<T>;

  getMultipartReader(): Promise<MultipartReader>;
}
