import type { DataType } from './data-type/data-type.interface';

/**
 * @interface DataTypeContainer
 */
export interface DataTypeContainer {
  types?: Record<DataType.Name, DataType>;
}
