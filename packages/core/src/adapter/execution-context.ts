import type { HttpServerRequest } from './http/http-server-request';
import type { HttpServerResponse } from './http/http-server-response';
import type { Protocol } from './platform-adapter';

export interface ExecutionContext<TSpace extends object = Record<string | number | symbol, any>> {

  readonly protocol: Protocol;

  readonly platform: string;

  space: TSpace;

  errors: Error[];

  executionScope: Record<string | number | symbol, any>;

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
