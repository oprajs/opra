import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.updateMany', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      res.header(HttpHeaderCodes.Content_Type, 'application/opra+json');
      res.end(JSON.stringify({affected: 10}));
    })
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .updateMany(data).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toEqual(undefined);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .updateMany(data).fetch(HttpObserveType.Response);
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers').updateMany(data, {observe: HttpObserveType.Events}).subscribe({
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
