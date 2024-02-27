import { HttpStatusRange } from '../../http/index.js';
import type { MediaContent } from './media-content.interface.js';
import type { Parameter } from './parameter.interface.js';

export interface Response extends MediaContent {
  statusCode: HttpStatusRange | HttpStatusRange[];
  headers?: Parameter[];
}
