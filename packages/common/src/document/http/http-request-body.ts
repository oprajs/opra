import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiNode } from '../api-node.js';
import { HttpMediaContent } from './http-media-content.js';
import type { HttpOperation } from './http-operation';

/**
 * @namespace HttpRequestBody
 */
export namespace HttpRequestBody {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.RequestBody, 'content'> {
    content: HttpMediaContent.InitArguments[];
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.Http.RequestBody, 'content'>> {
    content: HttpMediaContent.DecoratorMetadata[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Http.RequestBody, 'content'>> {
  }
}


export class HttpRequestBody extends ApiNode {
  readonly parent: HttpOperation;
  description?: string;
  content: HttpMediaContent[];
  required?: boolean;
  maxContentSize?: number;


  constructor(parent: HttpOperation, init: HttpRequestBody.InitArguments) {
    super(parent);
    this.description = init.description;
    this.required = init.required;
    this.maxContentSize = init.maxContentSize;
    this.content = [];
    if (init.content)
      for (const c of init.content) {
        this.content.push(new HttpMediaContent(this, c));
      }
  }

  toJSON(): OpraSchema.Http.RequestBody {
    const out = omitUndefined<OpraSchema.Http.RequestBody>({
      description: this.description,
      content: [],
      required: this.required,
      maxContentSize: this.maxContentSize
    })
    for (const c of this.content) {
      out.content.push(c.toJSON());
    }
    return out;
  }

}
