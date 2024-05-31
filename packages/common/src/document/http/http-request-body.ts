import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { HttpMediaType } from './http-media-type.js';
import type { HttpOperation } from './http-operation';

/**
 * @namespace HttpRequestBody
 */
export namespace HttpRequestBody {
  export interface Metadata extends Partial<StrictOmit<OpraSchema.HttpRequestBody, 'content'>> {
    content: HttpMediaType.Metadata[];
    immediateFetch?: boolean;
  }

  export interface Options extends Partial<StrictOmit<OpraSchema.HttpRequestBody, 'content'>> {
    immediateFetch?: boolean;
  }
}

/**
 * @class HttpRequestBody
 */
export class HttpRequestBody extends DocumentElement {
  description?: string;
  content: HttpMediaType[] = [];
  required?: boolean;
  maxContentSize?: number;
  immediateFetch?: boolean;

  constructor(readonly owner: HttpOperation) {
    super(owner);
  }

  toJSON(): OpraSchema.HttpRequestBody {
    return omitUndefined<OpraSchema.HttpRequestBody>({
      description: this.description,
      required: this.required,
      maxContentSize: this.maxContentSize,
      content: this.content.length ? this.content.map(x => x.toJSON()) : [],
    });
  }
}
