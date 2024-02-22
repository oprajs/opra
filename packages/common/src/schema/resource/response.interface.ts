import type { HttpStatusCode } from '../../http/index';
import type { DataType } from '../data-type/data-type.interface.js';
import type { Parameter } from './parameter.interface.js';

export interface Response {
  statusCode: HttpStatusCode;
  description?: string;
  type?: DataType.Name | DataType;
  contentType?: string;
  contentEncoding?: string;
  headers?: Parameter[];
}
