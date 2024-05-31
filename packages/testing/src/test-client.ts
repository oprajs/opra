import { IncomingMessage, Server, ServerResponse } from 'http';
import { FetchBackend, HttpClientBase, kBackend } from '@opra/client';
import { ApiExpect } from './api-expect/api-expect.js';
import { TestBackend } from './test-backend.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
export const kContext = Symbol.for('kContext');

export type ResponseExt = { expect: ApiExpect };

export class OpraTestClient extends HttpClientBase<FetchBackend.RequestOptions, ResponseExt> {
  [kBackend]: TestBackend;

  constructor(app: Server | RequestListener, options?: FetchBackend.Options) {
    super(new TestBackend(app, options));
  }
}
