import bodyParser from 'body-parser';
import type { Application } from 'express';
import { normalizePath, OpraDocument } from '@opra/common';
import type { IHttpExecutionContext } from '../interfaces/execution-context.interface';
import { ExpressRequestWrapperHost } from './classes/express-request-wrapper.host.js';
import { ExpressResponseWrapperHost } from './classes/express-response-wrapper.host.js';
import { HttpExecutionContextHost } from './classes/http-execution-context.host.js';
import { OpraHttpAdapter } from './http-adapter.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapter<IHttpExecutionContext> {

  static async init(
      app: Application,
      document: OpraDocument,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const adapter = new OpraExpressAdapter(document);
    await adapter._init(options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    app.use(prefix, bodyParser.json());
    app.use(prefix, (request, response, next) => {
      (async () => {
        const executionContext = new HttpExecutionContextHost('express',
            new ExpressRequestWrapperHost(request),
            new ExpressResponseWrapperHost(response));
        await adapter.handler(executionContext);
      })().catch(e => next(e));
    });
    return adapter;
  }

}


