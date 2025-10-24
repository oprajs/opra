import { DataTypeContainer } from './data-type-container.interface.js';
import { Transport } from './types.js';

/**
 * @interface Api
 */
export interface Api extends DataTypeContainer {
  transport: Transport;
  /**
   * Name of the api. Should be a computer-friendly name
   */
  name: string;
  description?: string;
}
