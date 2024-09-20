import type { Value } from '../value.interface.js';

/**
 *
 * @interface MsgHeader
 */
export interface MsgHeader extends Value {
  /**
   * Name of the parameter. RegExp pattern can be used matching parameter name
   */
  name: string | RegExp;

  /**
   * Indicates if parameter value required
   */
  required?: boolean;

  /**
   * Indicates if the parameter is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;
}
