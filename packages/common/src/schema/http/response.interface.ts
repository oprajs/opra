import type { MediaContent } from './media-content.interface';
import type { Parameter } from './parameter.interface';

/**
 *
 * @interface Response
 */
export interface Response extends MediaContent {
  statusCode: string | string[];
  headers?: Parameter[];
}

