import { OpraSchema } from '@opra/common';

export interface ExecutionContext {
  protocol: OpraSchema.Protocol;
  platform: ExecutionContext.PlatformInfo;

  onFinish(fn: (error: Error | undefined, context: ExecutionContext) => void | Promise<void>): void;
}

export namespace ExecutionContext {
  export interface PlatformInfo {
    name: string;

    [index: string]: any;
  }
}
