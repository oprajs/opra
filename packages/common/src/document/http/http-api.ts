import { OpraSchema } from '../../schema/index.js';
import { ApiBase } from '../api-base.js';
import type { ApiDocument } from '../api-document';
import type { HttpResource } from './http-resource.js';

/**
 * @namespace HttpApi
 */
export namespace HttpApi {
  export interface InitArguments extends ApiBase.InitArguments, Pick<OpraSchema.HttpApi, 'url'> {
  }
}

/**
 * @class HttpApi
 */
export class HttpApi extends ApiBase {
  readonly protocol = 'http';
  root: HttpResource;
  url?: string;

  constructor(parent: ApiDocument, init: HttpApi.InitArguments) {
    super(parent, init);
    this.url = init?.url;
  }

  toJSON(): OpraSchema.HttpApi {
    const schema = super.toJSON();
    return {
      ...schema,
      protocol: this.protocol,
      url: this.url,
      root: this.root.toJSON()
    }
  }

}
