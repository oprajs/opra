import { DataType } from '../data-type/data-type.interface.js';
import { Endpoint } from './endpoint.interface.js';

export interface Action extends Endpoint {
  returnType?: string | DataType;
  returnMime?: string;
}
