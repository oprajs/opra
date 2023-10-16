import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.updateMany', function () {

  const data = {id: 1, givenName: 'dfd'};
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
        .updateMany(data)
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(body.affected).toBeGreaterThanOrEqual(1);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .updateMany(data)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers')
        .updateMany(data)
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

  it('Should send request with "filter" param', async () => {
    await client.collection('Customers')
        .updateMany(data, {filter: '_id=1'})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/Customers?filter=_id%3D1');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['filter']);
    expect(app.lastRequest.query.filter).toStrictEqual('_id=1');
  });

});
