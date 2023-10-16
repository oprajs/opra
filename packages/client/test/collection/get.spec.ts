import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.get', function () {

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
        .get(1)
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1');
    expect(body.payload).toMatchObject({
      _id: /^d+$/
    });
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers')
        .get(1)
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

  it('Should send request with "include" param', async () => {
    await client.collection('Customers')
        .get(1, {include: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1?include=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['include']);
    expect(app.lastRequest.query.include).toStrictEqual('_id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.collection('Customers')
        .get(1, {pick: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1?pick=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['pick']);
    expect(app.lastRequest.query.pick).toStrictEqual('_id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.collection('Customers')
        .get(1, {omit: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers@1?omit=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['omit']);
    expect(app.lastRequest.query.omit).toStrictEqual('_id,givenName');
  });

});
