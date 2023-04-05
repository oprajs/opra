import { HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer } from '../_support/create-mock-server.js';

describe('Collection.updateMany', function () {

  let app;
  let client: OpraHttpClient;
  const data = {id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = app.client;
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .updateMany(data).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toEqual(app.respBody);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .updateMany(data).fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.collection('Customers').updateMany(data, {observe: 'events'}).subscribe({
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

  it('Should send request with "$filter" param', async () => {
    await client.collection('Customers')
        .updateMany(data, {filter: 'id=1'}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$filter']);
    expect(app.lastRequest.query.$filter).toStrictEqual('id=1');
  });

});
