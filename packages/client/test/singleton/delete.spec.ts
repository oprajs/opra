import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Singleton.delete', function () {

  let app: MockServer;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.singleton('auth/MyProfile')
        .delete()
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile');
    expect(body.affected).toEqual(1);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.singleton('auth/MyProfile')
        .delete()
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.singleton('MyProfile')
        .delete()
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
