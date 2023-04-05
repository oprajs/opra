import bodyParser from 'body-parser';
import type { Application } from 'express';
import { ApiDocument, normalizePath } from '@opra/common';
import { HttpExecutionContext } from '../interfaces/execution-context.interface.js';
import { ExpressRequestWrapperHost } from './express-request-wrapper.host.js';
import { ExpressResponseWrapperHost } from './express-response-wrapper.host.js';
import { OpraHttpAdapter } from './http-adapter.js';
import { HttpExecutionContextHost } from './http-execution-context.host.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
  }
}

export class OpraExpressAdapter extends OpraHttpAdapter<HttpExecutionContext> {

  static async create(
      app: Application,
      document: ApiDocument,
      options?: OpraExpressAdapter.Options
  ): Promise<OpraExpressAdapter> {
    const adapter = new OpraExpressAdapter(document);
    await adapter.init(options);
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


