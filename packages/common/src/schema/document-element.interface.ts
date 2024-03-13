import type { DataType } from './data-type/data-type.interface';

/**
 * @interface DocumentElement
 */
export interface DocumentElement {
  types?: Record<DataType.Name, DataType>;
}
