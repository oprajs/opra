import type { SearchParams } from '@opra/url';
import type { HttpStatus } from '../enums';
import type { ApiException } from '../exception';
import type { HeadersObject } from '../helpers/headers';
import type { ExecutionQuery } from '../implementation/execution-query';
import type { OpraService } from '../implementation/opra-service';
import type { Resource } from '../implementation/resource/resource';

export interface ExecutionContext {
  readonly service: OpraService;
  readonly resource: Resource;
  readonly request: ExecutionRequest;
  readonly response: ExecutionResponse;
  readonly resultPath: string;
  userContext?: any;
  continueOnError?: boolean;
}

export interface ExecutionRequest {
  query: ExecutionQuery;
  params: SearchParams;
  headers: HeadersObject;
  parentQuery?: ExecutionQuery;
  parentValue?: any;
}

export interface ExecutionResponse {
  status?: HttpStatus;
  headers: HeadersObject;
  errors: ApiException[];
  value?: any;
  total?: number;
}
