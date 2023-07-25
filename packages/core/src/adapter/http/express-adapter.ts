import type { Application, NextFunction, Request, Response } from 'express';
import { ApiDocument, OpraURLPath } from '@opra/common';
import { OpraHttpAdapter, OpraHttpAdapterBase } from './http-adapter.js';
import { HttpServerRequest } from './impl/http-server-request.js';
import { HttpServerResponse } from './impl/http-server-response.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapterBase {

  protected platform = 'express';

  static async create(
      app: Application,
      api: ApiDocument,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const express = await import('express');
    const adapter = new OpraExpressAdapter(api);
    await adapter.init(options);
    const basePath = new OpraURLPath(options?.basePath);
    app.use(basePath.toString(), express.json());
    app.use(basePath.toString(), (_req: Request, _res: Response, next: NextFunction) => {
      const req = HttpServerRequest.create(_req);
      const res = HttpServerResponse.create(_res);
      adapter.handler(req, res)
          .catch(e => {
            (adapter.logger?.fatal || adapter.logger?.error)?.(e);
            next(e);
          });
    });
    return adapter;
  }

}
