import type { DataType } from '../data-type/data-type.interface.js';
import type { Parameter } from './parameter.interface.js';

export interface Endpoint<TOptions extends Object = any> {
  description?: string;
  headers?: Parameter[];
  parameters?: Parameter[];
  returnType?: string | DataType;
  returnMime?: string;
  options?: TOptions;
}
