import type { DataType } from '../data-type/data-type.interface.js';
import type { HttpMultipartField } from './http-multipart-field.interface.js';

/**
 *
 * @interface HttpMediaType
 */
export interface HttpMediaType {
  /**
   * A brief description.
   * [CommonMark](https://commonmark.org/) syntax MAY be used for rich text representation
   */
  description?: string;

  /**
   * Media type (MIME) or [range of media types](https://datatracker.ietf.org/doc/html/rfc7231#section-5.3.2)
   */
  contentType?: string | string[];

  /**
   * Determines encoding of the content.
   */
  contentEncoding?: string;

  /**
   * DataType to be used for decoding.
   */
  type?: DataType.Name | DataType;

  /**
   * Determines if the content is an array
   * @deprecated
   */
  isArray?: boolean;

  /**
   * Example of the content data. The `example` field is mutually exclusive of the `examples` field.
   */
  example?: string;

  /**
   * Examples of the content data. The `examples` field is mutually exclusive of the `example` field.
   */
  examples?: Record<string, string>;

  /**
   * Indicates whether the system should automatically handle range downloads
   */
  autoRange?: boolean;

  /**
   * Content info for each field for multipart contents
   */
  multipartFields?: HttpMultipartField[];

  /**
   * Determines maximum number of multipart item
   */
  maxParts?: number;

  /**
   * Determines maximum size of each multipart item
   */
  maxPartSize?: number;

  /**
   * Determines maximum size of each multipart field
   */
  maxFieldSize?: number;

  /**
   * Determines maximum size of all multipart items
   */
  maxTotalSize?: number;
}
