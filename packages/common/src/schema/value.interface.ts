import type { DataType } from './data-type/data-type.interface.js';

/**
 *
 * @interface Value
 */
export interface Value {
  /**
   * Data type of the value
   */
  type?: DataType.Name | DataType;

  /**
   * Indicates if the value is an array
   */
  isArray?: boolean;

  /**
   * Defines the description of the parameter
   */
  description?: string;

  /**
   * Defines example values for the parameter
   */
  examples?: any[] | Record<string, any>;
}
