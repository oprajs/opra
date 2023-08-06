import type { Application } from 'express';
import type { ApiDocument } from '@opra/common';
import type { PlatformAdapter } from '../platform-adapter.js';
import { ExpressAdapterHost } from './express-adapter.host.js';
import type { HttpAdapter } from './http-adapter.js';

export interface ExpressAdapter extends PlatformAdapter {
  readonly app: Application;
}

/**
 * @namespace
 */
export namespace ExpressAdapter {
  export interface Options extends HttpAdapter.Options {
  }

  export async function create(app: Application, api: ApiDocument, options?: ExpressAdapter.Options): Promise<ExpressAdapter> {
    const adapter = new ExpressAdapterHost(app, api, options);
    await adapter.init();
    return adapter;
  }
}
