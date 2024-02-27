import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiElement } from './api-element.js';
import { ApiMediaContent } from './api-media-content.js';
import type { ApiOperation } from './api-operation.js';

/**
 * @namespace ApiRequestBody
 */
export namespace ApiRequestBody {
  export interface InitArguments extends StrictOmit<OpraSchema.RequestBody, 'content'> {
    content: ApiMediaContent.InitArguments[];
  }

  export interface DecoratorMetadata extends Partial<StrictOmit<OpraSchema.RequestBody, 'content'>> {
    content: ApiMediaContent.DecoratorMetadata[];
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.RequestBody, 'content'>> {
  }
}


export class ApiRequestBody extends ApiElement {
  readonly parent: ApiOperation;
  description?: string;
  content: ApiMediaContent[];
  required?: boolean;
  maxContentSize?: number;


  constructor(parent: ApiOperation, init: ApiRequestBody.InitArguments) {
    super(parent);
    this.description = init.description;
    this.required = init.required;
    this.maxContentSize = init.maxContentSize;
    this.content = [];
    if (init.content)
      for (const c of init.content) {
        this.content.push(new ApiMediaContent(this, c));
      }
  }

  exportSchema(): OpraSchema.RequestBody {
    const out = omitUndefined<OpraSchema.RequestBody>({
      description: this.description,
      content: [],
      required: this.required,
      maxContentSize: this.maxContentSize
    })
    for (const c of this.content) {
      out.content.push(c.exportSchema());
    }
    return out;
  }

}
