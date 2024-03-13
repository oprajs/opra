import type { DocumentElement } from '../type-scope.interface';
import type { Parameter } from './parameter.interface';
import type { Response } from './response.interface';

/**
 * @interface
 * @abstract
 */
export interface Endpoint extends DocumentElement {
  kind: string;
  description?: string;
  parameters?: Parameter[];
  responses?: Response[];
}
