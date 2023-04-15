import { HttpRequestMessage, HttpResponseMessage } from '@opra/common';
import { Request } from './request.interface.js';
import { Response } from './response.interface.js';

export namespace ExecutionContext {
  export type Protocol = 'http' | 'ws' | 'rpc';
  // export type OnFinishArgs = {
  //   context: ExecutionContext;
  //   failed: boolean;
  // }
}

export interface ExecutionContext {

  readonly protocol: ExecutionContext.Protocol;

  readonly platform: string;

  readonly request: Request;

  readonly response: Response;

  user?: any;

  switchToHttp(): HttpExecutionContext;

  switchToWs(): WsExecutionContext;

  switchToRpc(): RpcExecutionContext;

  // on(event: 'finish', fn: (args: ExecutionContext.OnFinishArgs) => void | Promise<void>);
}


export interface HttpExecutionContext extends Omit<ExecutionContext, 'request' | 'response'> {

  readonly request: HttpRequestMessage;

  readonly response: HttpResponseMessage;
}


export interface WsExecutionContext extends Omit<ExecutionContext, 'request' | 'response'> {

}


export interface RpcExecutionContext extends Omit<ExecutionContext, 'request' | 'response'> {

}
