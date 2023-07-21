import type { Application, NextFunction, Request, Response } from 'express';
import { ApiDocument, normalizePath } from '@opra/common';
import { OpraHttpAdapter } from './http-adapter.js';
import { HttpServerRequest } from './impl/http-server-request.js';
import { HttpServerResponse } from './impl/http-server-response.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapter {

  protected platform = 'express';

  static async create(
      app: Application,
      document: ApiDocument,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const express = await import('express');
    const adapter = new OpraExpressAdapter(document);
    await adapter.init(options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    app.use(prefix, express.json());
    app.use(prefix, (req: Request, res: Response, next: NextFunction) => {
      adapter.handler(HttpServerRequest.create(req), HttpServerResponse.create(res))
          .catch(e => next(e));
    });
    return adapter;
  }

}
