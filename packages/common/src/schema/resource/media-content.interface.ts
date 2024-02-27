import type { DataType } from '../data-type/data-type.interface.js';

/**
 *
 * @interface MediaContent
 */
export interface MediaContent {

  /**
   * A brief description.
   * [CommonMark](https://commonmark.org/) syntax MAY be used for rich text representation
   */
  description?: string;

  /**
   * Media type (MIME) or [range of media types](https://datatracker.ietf.org/doc/html/rfc7231#section-5.3.2)
   */
  contentType: string;

  /**
   * Determines encoding of the content.
   */
  contentEncoding?: string;

  /**
   * DataType to be used for decoding.
   */
  type?: DataType.Name | DataType;

  /**
   * Content info for each field for multipart contents. The key is field name or RegExp pattern.
   */
  multipartFields?: Record<string, MediaContent>;

  /**
   * Example of the content data. The `example` field is mutually exclusive of the `examples` field.
   */
  example?: string;

  /**
   * Examples of the content data. The `examples` field is mutually exclusive of the `example` field.
   */
  examples?: Record<string, string>;
}
