import { FetchBackend, HttpClientBase, kBackend } from '@opra/client';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { ApiExpect } from './api-expect/api-expect.js';
import { TestBackend } from './test-backend.js';

declare type RequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;
export const kContext = Symbol.for('kContext');

export type ResponseExt = { expect: ApiExpect };

export namespace OpraTestClient {
  export interface Options extends FetchBackend.Options {
    basePath?: string;
  }
}

/**
 * Test specific implementation of {@link HttpClientBase} for API testing.
 *
 * @class OpraTestClient
 */
export class OpraTestClient extends HttpClientBase<
  FetchBackend.RequestOptions,
  ResponseExt
> {
  declare [kBackend]: TestBackend;

  /**
   * Creates a new instance of OpraTestClient.
   *
   * @param app The server or request listener to test.
   * @param options Configuration options.
   */
  constructor(app: Server | RequestListener, options?: OpraTestClient.Options) {
    super(new TestBackend(app, options));
  }
}
