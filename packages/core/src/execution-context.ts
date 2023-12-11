import { ExecutionContextHost } from './execution-context.host.js';
import type { HttpServerRequest } from './http/http-server-request.js';
import type { HttpServerResponse } from './http/http-server-response.js';
import type { Protocol } from './platform-adapter.js';

export interface ExecutionContext {

  readonly protocol: Protocol;

  readonly platform: string;

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

  export function is(v: any) {
    return v instanceof ExecutionContextHost ||
        (typeof v.protocol === 'string' &&
            typeof v.platform === 'string' &&
            typeof v.switchToHttp === 'function' &&
            typeof v.switchToWs === 'function' &&
            typeof v.switchToRpc === 'function'
        )
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
