import bodyParser from 'body-parser';
import type { Application, NextFunction, Request, Response } from 'express';
import { ApiDocument, normalizePath } from '@opra/common';
import { OpraHttpAdapter } from './http-adapter.js';
import { HttpRequestMessage } from './http-request-message.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

const noOp = () => void 0;

export class OpraExpressAdapter extends OpraHttpAdapter {

  protected platform = 'express';

  static async create(
      app: Application,
      document: ApiDocument,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const adapter = new OpraExpressAdapter(document);
    await adapter.init(options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    app.use(prefix, bodyParser.json());
    app.use(prefix, (req: Request, res: Response, next: NextFunction) => {
      (req as any).end = noOp as any;
      (req as any).send = noOp as any;
      adapter.handler(req as (Request & Pick<HttpRequestMessage, 'end' | 'send'>), res).catch(e => next(e));
    });
    return adapter;
  }

}
