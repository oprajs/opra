import { StrictOmit } from 'ts-gems';
import { DataType } from '../data-type/data-type.interface.js';

/**
 *
 * @interface Parameter
 */
export interface Parameter {

  /**
   * Name or the name pattern of the parameter
   */
  name: string | RegExp;

  /**
   * Data type of the parameter
   */
  type?: DataType.Name;

  /**
   * Defines the description of the parameter
   */
  description?: string;

  /**
   * Indicates if the parameter value is an array
   */
  isArray?: boolean;

  /**
   * Indicates if parameter value required
   */
  required?: boolean;

  /**
   * Defines example values for the parameter
   */
  examples?: any[] | Record<string, any>;

  /**
   * Indicates if the parameter is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;

  // instructions?: Record<string, any>;

}

/**
 *
 * @interface KeyParameter
 */
export interface KeyParameter extends StrictOmit<Parameter, 'name' | 'required' | 'isArray'> {
  name: string;
}
