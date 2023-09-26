import http from 'http';
import type { ApiDocument, OpraURLPath } from '@opra/common';
import type { PlatformAdapter } from '../../platform-adapter';
import { NodeHttpAdapterHost } from './node-http-adapter.host.js';

export interface NodeHttpAdapter extends PlatformAdapter {
  readonly basePath: OpraURLPath;
  readonly server: http.Server;
}

/**
 * @namespace NodeHttpAdapter
 */
export namespace NodeHttpAdapter {
  export type Options = PlatformAdapter.Options & {
    basePath?: string;
  }

  export async function create(api: ApiDocument, options?: Options): Promise<NodeHttpAdapter> {
    return NodeHttpAdapterHost.create(api, options);
  }

}
