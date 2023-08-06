import http from 'http';
import type { ApiDocument, OpraURLPath } from '@opra/common';
import type { PlatformAdapter } from '../platform-adapter';
import { HttpAdapterHost } from './http-adapter.host.js';

export interface HttpAdapter extends PlatformAdapter {
  readonly basePath: OpraURLPath;
  readonly server: http.Server;
}


/**
 * @namespace HttpAdapter
 */
export namespace HttpAdapter {
  export type Options = PlatformAdapter.Options & {
    basePath?: string;
  }

  export async function create(api: ApiDocument, options?: Options): Promise<HttpAdapter> {
    const adapter = new HttpAdapterHost(api, options);
    await adapter.init();
    return adapter;
  }

}
