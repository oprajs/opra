import type { Api } from '../api.interface.js';
import type { MQController } from './mq-controller.interface.js';

/**
 * Message Queue Api
 * @interface MQApi
 */
export interface MQApi extends Api {
  transport: 'mq';
  /**
   * Name of the platform. (Kafka, RabbitMQ, etc.)
   */
  platform: string;
  description?: string;
  controllers: Record<string, MQController>;
}
