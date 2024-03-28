export interface Attribute {
  /**
   * Data format of the attribute
   */
  format: 'string' | 'number' | 'boolean';

  /**
   * Defines the description of the attribute
   */
  description?: string;

  /**
   * Indicates if the attribute is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;
}
