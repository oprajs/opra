import type { Api } from '../api.interface.js';
import type { HttpController } from './http-controller.interface.js';

/**
 * HTTP Api
 * @interface HttpApi
 */
export interface HttpApi extends Api {
  transport: 'http';
  description?: string;
  url?: string;
  controllers: Record<string, HttpController>;
}
