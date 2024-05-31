import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiBase } from '../common/api-base.js';
import { HttpController } from './http-controller.js';

/**
 * @class HttpApi
 */
export class HttpApi extends ApiBase {
  readonly protocol = 'http';
  root: HttpController;
  url?: string;

  constructor(readonly owner: ApiDocument) {
    super(owner);
  }

  toJSON(): OpraSchema.HttpApi {
    const schema = super.toJSON();
    return {
      ...schema,
      protocol: this.protocol,
      url: this.url,
      root: this.root.toJSON(),
    };
  }
}
