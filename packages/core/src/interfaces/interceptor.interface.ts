import { ExecutionContext } from '../execution-context.js';

export type Interceptor = (context: ExecutionContext, next: (() => Promise<void>)) => Promise<void>;
