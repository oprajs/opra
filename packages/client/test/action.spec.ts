import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../src/index.js';
import { createMockServer, MockServer } from './_support/create-mock-server.js';

describe('Actions', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());

  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      res.header(HttpHeaderCodes.Content_Type, 'application/opra+json');
      res.json({data});
    })
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.action('auth/login', {user: 'john'})
        .getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(app.lastRequest.query.user).toStrictEqual('john');
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.action('auth/login')
        .getData();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/auth/login');
    expect(resp).toMatchObject({data});
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.action('auth/login')
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/auth/login');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.action('auth/login')
        .observe(HttpObserveType.Events)
        .subscribe({
          next: (event) => {
            receivedEvents.push(event.event);
          },
          complete: () => {
            try {
              expect(expectedEvents).toStrictEqual(receivedEvents);
            } catch (e) {
              return done(e);
            }
            done();
          },
          error: done
        });
  });

});
