import { finalize, Observable } from 'rxjs';
import { ApiDocument, HttpHeaderCodes, OpraSchema } from '@opra/common';
import {
  FetchBackend,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpObserveType,
  HttpResponse,
  OpraHttpClient,
} from '../src/index.js';
import { createMockServer, MockServer } from './_support/create-mock-server.js';

describe('OpraClient', function () {
  let app: MockServer;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, { document: app.api });
  });

  it('Should retrieve api document schema', async () => {
    expect(await client.getSchema()).toBeInstanceOf(ApiDocument);
  });

  it('Should getSchema() reject promise on error', async () => {
    const xClient = new OpraHttpClient('http://127.0.0.1:1001');
    await expect(() => xClient.getSchema()).rejects.toThrow('Error fetching api schema');
  });

  it('Should getSchema() be called only one at a time', async () => {
    const requestCount = app.requestCount;
    await Promise.all([client.getSchema(), client.getSchema(), client.getSchema()]);
    expect(app.requestCount).toEqual(requestCount + 1);
    await Promise.all([client.getSchema(), client.getSchema(), client.getSchema()]);
    expect(app.requestCount).toEqual(requestCount + 2);
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.request('auth/login', { params: { user: 'john' } }).getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(app.lastRequest.query.user).toStrictEqual('john');
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.request('auth/login', { params: { user: 'john' } }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/login?user=john');
    expect(body).toEqual({
      type: 'LoginResult',
      payload: { user: 'john', token: '123456' },
    });
  });

  it('Should return Response object if observe=response or undefined', async () => {
    const resp = await client.request('auth/login', { params: { user: 'john' } }).getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/auth/login?user=john');
    expect(resp).toBeInstanceOf(HttpResponse);
    expect(resp.body).toEqual({
      type: 'LoginResult',
      payload: { user: 'john', token: '123456' },
    });
  });

  it('Should run interceptor chain', async () => {
    const callStack: string[] = [];
    const client2 = new OpraHttpClient(app.baseUrl, {
      document: app.api,
      interceptors: [
        {
          intercept(request: FetchBackend.RequestInit, next: HttpHandler): Observable<HttpEvent> {
            callStack.push('a1');
            return next.handle(request).pipe(
              finalize(() => {
                callStack.push('a2');
              }),
            );
          },
        },
        {
          intercept(request: FetchBackend.RequestInit, next: HttpHandler): Observable<HttpEvent> {
            callStack.push('b1');
            return next.handle(request).pipe(
              finalize(() => {
                callStack.push('b2');
              }),
            );
          },
        },
      ],
    });
    await client2.request('Customers@1').getResponse();
    expect(callStack).toEqual(['a1', 'b1', 'b2', 'a2']);
  });

  it('Should subscribe events', done => {
    const expectedEvents = ['Sent', 'ResponseHeader', 'Response'];
    const receivedEvents: HttpEventType[] = [];
    client
      .request('auth/login', { params: { user: 'john' } })
      .observe(HttpObserveType.Events)
      .subscribe({
        next: event => {
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
        error: done,
      });
  });
});
