import type { ExecutionContext } from '../execution-context.js';

export interface RequestHandler {
  handle(executionContext: ExecutionContext): Promise<void>;
}
