import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';
import { ApiElement } from './api-element.js';


/**
 * @namespace ApiMediaContent
 */
export namespace ApiMediaContent {
  export interface InitArguments extends StrictOmit<OpraSchema.MediaContent, 'type' | 'multipartFields'> {
    type?: DataType | string | Type;
    multipartFields?: Record<string, InitArguments>;
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.MediaContent, 'type' | 'multipartFields'>> {
    type?: Type | string;
    multipartFields?: Record<string, DecoratorMetadata>;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.MediaContent, 'type' | 'multipartFields'>> {
    type?: Type | string;
  }
}


export class ApiMediaContent extends ApiElement {
  readonly parent: ApiElement;
  description?: string;
  contentType: string;
  contentEncoding?: string;
  type?: DataType;
  example?: string;
  examples?: Record<string, string>;
  multipartFields?: Map<string | RegExp, ApiMediaContent>;

  constructor(parent: ApiElement, init: ApiMediaContent.InitArguments) {
    super(parent);
    this.description = init?.description;
    this.contentType = init?.contentType;
    this.contentEncoding = init?.contentEncoding;
    if (init?.type)
      this.type = init.type instanceof DataType
          ? init.type
          : this.document.getDataType(init.type);
    this.example = !init?.examples ? init?.example : undefined;
    this.examples = init?.examples;
    if (init.multipartFields) {
      this.multipartFields = new Map();
      for (const [n, x] of Object.entries(init.multipartFields)) {
        const k = n.startsWith('/') ? parseRegExp(n, {includeFlags: 'i', excludeFlags: 'm'}) : n;
        this.multipartFields.set(k, new ApiMediaContent(this, x));
      }
    }
  }

  exportSchema(): OpraSchema.MediaContent {
    const out = omitUndefined<OpraSchema.MediaContent>({
      description: this.description,
      contentType: this.contentType,
      contentEncoding: this.contentEncoding,
      type: this.type?.name ? this.type.name : this.type?.exportSchema(),
      example: this.example,
      examples: this.examples
    })
    if (this.multipartFields) {
      out.multipartFields = {};
      for (const [k, f] of this.multipartFields.entries()) {
        out.multipartFields[String(k)] = f.exportSchema();
      }
    }
    return out;
  }

  //
  // getEncoder(): Validator {
  //   if (!this._encoder) {
  //     if (this.type)
  //       this._encoder = this.type.generateCodec('encode', {partial: true, operation: 'read'});
  //     else this._encoder = isAny;
  //   }
  //   return this._encoder;
  // }

}
