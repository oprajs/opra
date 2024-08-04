import { FetchBackend, HttpClientBase, kBackend } from '@opra/client';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { ApiExpect } from './api-expect/api-expect.js';
import { TestBackend } from './test-backend.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
export const kContext = Symbol.for('kContext');

export type ResponseExt = { expect: ApiExpect };

export namespace OpraTestClient {
  export interface Options extends FetchBackend.Options {
    basePath?: string;
  }
}

export class OpraTestClient extends HttpClientBase<FetchBackend.RequestOptions, ResponseExt> {
  declare [kBackend]: TestBackend;

  constructor(app: Server | RequestListener, options?: OpraTestClient.Options) {
    super(new TestBackend(app, options));
  }
}
