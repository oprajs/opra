import type { Application, NextFunction, Request, Response } from 'express';
import { ApiDocument, OpraURLPath } from '@opra/common';
import { OpraHttpAdapter, OpraHttpAdapterBase } from './http-adapter.js';
import { HttpServerRequest } from './impl/http-server-request.js';
import { HttpServerResponse } from './impl/http-server-response.js';

const kOptions = Symbol.for('kOptions');

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapterBase {

  readonly platform = 'express';
  [kOptions]: OpraExpressAdapter.Options;

  constructor(app: Application, api: ApiDocument, options?: OpraExpressAdapter.Options) {
    super(api, options);
    const basePath = new OpraURLPath(options?.basePath);
    const _this = this;
    app.use(basePath.toString(), (_req: Request, _res: Response, next: NextFunction) => {
      const req = HttpServerRequest.from(_req);
      const res = HttpServerResponse.from(_res);
      this.handler(req, res)
          .catch(e => {
            (_this.logger?.fatal || _this.logger?.error)?.(e);
            next(e);
          });
    });
  }

  static async create(app: Application, api: ApiDocument, options?: OpraExpressAdapter.Options): Promise<OpraExpressAdapter> {
    const adapter = new OpraExpressAdapter(app, api, options);
    await adapter.init();
    return adapter;
  }

}
