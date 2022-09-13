import { ExecutionContext } from '@nestjs/common';
import * as Opra from '@opra/core';

export type OpraExecutionContext = Opra.ExecutionContext;

export namespace OpraExecutionContext {
  export function from(source: ExecutionContext): OpraExecutionContext {
    return source.getArgByIndex(4);
  }
}
