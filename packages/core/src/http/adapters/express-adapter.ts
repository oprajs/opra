import type { Application } from 'express';
import type { ApiDocument } from '@opra/common';
import type { PlatformAdapter } from '../../platform-adapter';
import { ExpressAdapterHost } from './express-adapter.host.js';
import type { NodeHttpAdapter } from './node-http-adapter';

export interface ExpressAdapter extends PlatformAdapter {
  readonly app: Application;
}

/**
 * @namespace
 */
export namespace ExpressAdapter {
  export interface Options extends NodeHttpAdapter.Options {
  }

  export async function create(app: Application, api: ApiDocument, options?: ExpressAdapter.Options): Promise<ExpressAdapter> {
    return ExpressAdapterHost.create(app, api, options);
  }
}
