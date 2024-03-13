import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiNode } from '../api-node.js';
import { DataType } from '../data-type/data-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';


/**
 * @namespace HttpMediaContent
 */
export namespace HttpMediaContent {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.MediaContent, 'type' | 'multipartFields'> {
    type?: string | DataType;
    multipartFields?: Record<string, InitArguments>;
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.Http.MediaContent, 'type' | 'multipartFields'>> {
    type?: Type | string;
    multipartFields?: Record<string, DecoratorMetadata>;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Http.MediaContent, 'type' | 'multipartFields'>> {
    type?: Type | string;
  }
}


export class HttpMediaContent extends ApiNode {
  readonly parent: ApiNode;
  description?: string;
  contentType: string;
  contentEncoding?: string;
  type?: DataType;
  partial?: boolean;
  example?: string;
  examples?: Record<string, string>;
  multipartFields?: Map<string | RegExp, HttpMediaContent>;

  constructor(parent: ApiNode, init: HttpMediaContent.InitArguments) {
    super(parent);
    this.description = init?.description;
    this.contentType = init?.contentType;
    this.contentEncoding = init?.contentEncoding;
    if (init.type) {
      if (init.type instanceof DataType) {
        this.type = init.type.isEmbedded ? init.type : this.findDataType(init.type.name!);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type.name!}) given for MediaContent "${this.contentType}" is not belong to this document scope`);
      } else {
        this.type = this.findDataType(init.type);
        if (!this.type)
          throw new TypeError(`Datatype (${init.type}) given for MediaContent "${this.contentType}" could not be found in document scope`);
      }
    }
    this.partial = init.partial;
    this.example = !init?.examples ? init?.example : undefined;
    this.examples = init?.examples;
    if (init.multipartFields) {
      this.multipartFields = new Map();
      for (const [n, x] of Object.entries(init.multipartFields)) {
        const k = n.startsWith('/') ? parseRegExp(n, {includeFlags: 'i', excludeFlags: 'm'}) : n;
        this.multipartFields.set(k, new HttpMediaContent(this, x));
      }
    }
  }

  toJSON(): OpraSchema.Http.MediaContent {
    const out = omitUndefined<OpraSchema.Http.MediaContent>({
      description: this.description,
      contentType: this.contentType,
      contentEncoding: this.contentEncoding,
      type: this.type?.name ? this.type.name : this.type?.toJSON(),
      partial: this.partial,
      example: this.example,
      examples: this.examples
    })
    if (this.multipartFields) {
      out.multipartFields = {};
      for (const [k, f] of this.multipartFields.entries()) {
        out.multipartFields[String(k)] = f.toJSON();
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
