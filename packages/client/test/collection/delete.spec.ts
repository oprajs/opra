import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.delete', function () {

  let app: MockServer;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.collection('Customers')
        .delete(1)
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1');
    expect(body.context).toEqual('/Customers');
    expect(body.affected).toEqual(1);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .delete(1)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers')
        .delete(1)
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

  it('Should send "delete" request with multiple keys', async () => {
    await client.collection('Customers')
        .delete({_id: 1, active: true})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.url).toStrictEqual('/Customers@_id=1;active=true');
  });

});
