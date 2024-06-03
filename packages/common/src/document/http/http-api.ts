import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiBase } from '../common/api-base.js';
import { HttpController } from './http-controller.js';

/**
 * @class HttpApi
 */
export class HttpApi extends ApiBase {
  readonly protocol = 'http';
  controllers: ResponsiveMap<HttpController> = new ResponsiveMap();
  url?: string;

  constructor(readonly owner: ApiDocument) {
    super(owner);
  }

  findController(resourcePath: string): HttpController | undefined {
    if (resourcePath.startsWith('/')) resourcePath = resourcePath.substring(1);
    if (resourcePath.includes('/')) {
      const a = resourcePath.split('/');
      let r = this.controllers.get(a.shift()!);
      while (r && a.length > 0) {
        r = r.controllers.get(a.shift()!);
      }
      return r;
    }
    return this.controllers.get(resourcePath);
  }

  toJSON(): OpraSchema.HttpApi {
    const schema = super.toJSON();
    const out: OpraSchema.HttpApi = {
      ...schema,
      protocol: this.protocol,
      url: this.url,
      controllers: {},
    };
    for (const [name, v] of this.controllers.entries()) {
      out.controllers[name] = v.toJSON();
    }
    return out;
  }
}
