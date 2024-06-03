import type { Application } from 'express';
import type { ApiDocument } from '@opra/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface.js';
import { ExpressAdapterHost } from './express-adapter.host.js';

export interface ExpressAdapter extends HttpAdapter {
  readonly app: Application;
}

/**
 * @namespace
 */
export namespace ExpressAdapter {
  export interface Options extends HttpAdapter.Options {
    basePath?: string;
  }

  export async function create(
    app: Application,
    document: ApiDocument,
    options?: ExpressAdapter.Options,
  ): Promise<ExpressAdapter> {
    return ExpressAdapterHost.create(app, document, options);
  }
}
