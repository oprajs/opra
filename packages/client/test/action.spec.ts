import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../src/index.js';
import { createMockServer, MockServer } from './_support/create-mock-server.js';

describe('Actions', function () {

  let app: MockServer;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.action('auth/login', {user: 'john'})
        .getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(app.lastRequest.query.user).toStrictEqual('john');
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.action('auth/login', {user: 'john'})
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/login?user=john');
    expect(body.context).toEqual('/auth/login');
    expect(body.payload).toEqual({user: 'john', token: '123456'});
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.action('auth/login', {user: 'john'})
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/login?user=john');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = [ 'Sent', 'ResponseHeader', 'Response'];
    const receivedEvents: HttpEventType[] = [];
    client.action('auth/login')
        .observe(HttpObserveType.Events)
        .subscribe({
          next: (event) => {
            receivedEvents.push(event.type);
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

  it('Should return body with simple type payload', async () => {
    const body = await client.action('auth/getToken')
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/getToken');
    expect(body.type).toEqual('opra:string');
    expect(body.typeUrl).toEqual('https://oprajs.com/spec/v1.0#/types/string');
    expect(body.payload).toEqual('123456');
  });

  it('Should return body with other mime', async () => {
    const body = await client.action('auth/getRawToken')
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/getRawToken');
    expect(app.lastResponse.getHeader('content-type')).toStrictEqual('text/plain; charset=utf-8');
    expect(body).toEqual('123456');
  });

});
