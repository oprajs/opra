import type { HttpServerRequest } from './http/http-server-request.js';
import type { HttpServerResponse } from './http/http-server-response.js';
import type { Protocol } from './platform-adapter.js';

export interface ExecutionContext<TSession extends {} = {}> {

  readonly protocol: Protocol;

  readonly platform: string;

  session: TSession;

  errors: Error[];

  switchToHttp(): HttpMessageContext;

  switchToWs(): WsMessageContext;

  switchToRpc(): RpcMessageContext;

  on(event: 'finish', fn: (args: ExecutionContext.OnFinishArgs) => void | Promise<void>);
}

export namespace ExecutionContext {
  export type OnFinishArgs = {
    context: ExecutionContext;
    failed: boolean;
  }
}

export interface HttpMessageContext {
  readonly platform: string;
  readonly incoming: HttpServerRequest;
  readonly outgoing: HttpServerResponse;

  switchToContext(): ExecutionContext;
}

export interface WsMessageContext {
  switchToContext(): ExecutionContext;
}

export interface RpcMessageContext {
  switchToContext(): ExecutionContext;
}
