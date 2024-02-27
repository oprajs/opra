import type { Parameter } from './parameter.interface.js';
import { Response } from './response.interface.js';

/**
 * @interface
 * @abstract
 */
export interface Endpoint {
  kind: string;
  description?: string;
  parameters?: Parameter[];
  responses?: Response[];
}
