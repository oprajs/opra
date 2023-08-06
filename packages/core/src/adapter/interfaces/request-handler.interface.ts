import type { ExecutionContext } from '../execution-context.js';

export interface RequestHandler {
  processRequest(executionContext: ExecutionContext): Promise<void>;
}
