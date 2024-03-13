import { OpraSchema } from '../schema/index.js';
import type { ApiDocument } from './api-document.js';
import { ApiDocumentElement } from './api-document-element.js';
import { API_NAME_PATTERN } from './constants.js';

export namespace ApiBase {
  export interface InitArguments extends Pick<OpraSchema.Api, 'description' | 'name'> {
  }
}

export abstract class ApiBase extends ApiDocumentElement {
  abstract readonly protocol: OpraSchema.Protocol;
  readonly name: string;
  description?: string;

  protected constructor(parent: ApiDocument, init: ApiBase.InitArguments) {
    super(parent);
    if (!API_NAME_PATTERN.test(init.name))
      throw new TypeError(`Invalid api name (${init.name})`);
    this.name = init.name;
    this.description = init?.description;
  }

  toJSON(): OpraSchema.Api {
    return {
      protocol: this.protocol,
      name: this.name,
      description: this.description
    }
  }

}
