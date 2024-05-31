import type { DataType } from '../data-type/data-type.interface';
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
   * Determines if content is array
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
   * Content info for each field for multipart contents
   */
  multipartFields?: HttpMultipartField[];

  /**
   * Determines maximum number of multipart fields
   */
  maxFields?: number;

  /**
   * Determines maximum size of each multipart field
   */
  maxFieldsSize?: number;

  /**
   * Determines maximum number of multipart files
   */
  maxFiles?: number;

  /**
   * Determines maximum size of each multipart file
   */
  maxFileSize?: number;

  /**
   * Determines maximum size of all multipart files
   */
  maxTotalFileSize?: number;

  /**
   * Determines minimum size of each multipart file
   */
  minFileSize?: number;
}
