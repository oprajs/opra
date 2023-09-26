import type { ExecutionContext } from '../execution-context.js';

export interface RequestHandler {
  handleExecution(executionContext: ExecutionContext): Promise<void>;
}
