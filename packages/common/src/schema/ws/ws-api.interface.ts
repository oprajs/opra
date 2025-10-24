import type { Api } from '../api.interface.js';
import { WSController } from './ws-controller.interface.js';

/**
 * WebSocket Api
 * @interface WSApi
 */
export interface WSApi extends Api {
  transport: 'ws';
  description?: string;
  controllers: Record<string, WSController>;
}
