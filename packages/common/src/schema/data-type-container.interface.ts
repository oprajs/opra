import type { DataType } from './data-type/data-type.interface.js';

/**
 * @interface DataTypeContainer
 */
export interface DataTypeContainer {
  types?: Record<DataType.Name, DataType>;
}
