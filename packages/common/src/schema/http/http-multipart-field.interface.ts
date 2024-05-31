import type { HttpMultipartFieldType } from '../types.js';
import type { HttpMediaType } from './http-media-type.interface.js';

export interface HttpMultipartField extends HttpMediaType {
  fieldName: string | RegExp;
  fieldType: HttpMultipartFieldType;
  required?: boolean;
}
