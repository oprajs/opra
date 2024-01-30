import type { Parameter } from './parameter.interface.js';

export interface Endpoint<TOptions extends Object = any> {
  description?: string;
  headers?: Parameter[];
  parameters?: Parameter[];
  options?: TOptions;
}
