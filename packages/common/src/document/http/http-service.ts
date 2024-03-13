import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiService } from '../api-service.js';
import type { HttpResource } from './http-resource.js';

/**
 * @namespace HttpService
 */
export namespace HttpService {
  export interface InitArguments extends Pick<OpraSchema.Http.Service, 'description' | 'url'> {
  }
}

/**
 * @class HttpService
 */
export class HttpService extends ApiService {
  readonly protocol = 'http';
  root: HttpResource;
  url?: string;

  constructor(parent: ApiDocument, serviceName: string, init?: HttpService.InitArguments) {
    super(parent, serviceName, init);
    this.url = init?.url;
  }

  toJSON(): OpraSchema.Http.Service {
    const schema = super.toJSON();
    return {
      ...schema,
      protocol: this.protocol,
      url: this.url,
      root: this.root.toJSON()
    }
  }

}
