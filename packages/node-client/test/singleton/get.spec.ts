import { HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer } from '../_support/create-mock-server.js';

describe('Singleton.get', function () {

  let app;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = app.client;
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.singleton('BestCustomer')
        .get().fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/BestCustomer');
    expect(resp).toEqual(app.respBody);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.singleton('BestCustomer')
        .get().fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/BestCustomer');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.singleton('BestCustomer').get({observe: 'events'}).subscribe({
      next: (events) => {
        receivedEvents.push(events.event);
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

  it('Should send request with "$include" param', async () => {
    await client.singleton('BestCustomer')
        .get({include: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/BestCustomer');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$include']);
    expect(app.lastRequest.query.$include).toStrictEqual('id,givenName');
  });

  it('Should send request with "$pick" param', async () => {
    await client.singleton('BestCustomer')
        .get({pick: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/BestCustomer');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$pick']);
    expect(app.lastRequest.query.$pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "$omit" param', async () => {
    await client.singleton('BestCustomer')
        .get({omit: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/BestCustomer');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$omit']);
    expect(app.lastRequest.query.$omit).toStrictEqual('id,givenName');
  });

});
