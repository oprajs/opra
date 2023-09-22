import type { DataType } from '../data-type/data-type.interface';
import type { DocumentBase } from './document-base.interface.js';

export interface TypeDocument extends DocumentBase {
  references?: Record<string, string | TypeDocument>;
  types?: Record<DataType.Name, DataType>;
}
