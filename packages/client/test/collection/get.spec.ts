import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { customersData } from '../../../../support/test/customers.data.js';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.get', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const rows: any[] = JSON.parse(JSON.stringify(customersData.slice(0, 1)));

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Total_Count, '10');
      res.header(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      res.header(HttpHeaderCodes.Content_Type, 'application/opra+json');
      res.json({data: rows[0]});
    })
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .getData();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(resp).toEqual({data: rows[0]});
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
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
        .get(1, {include: ['id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['include']);
    expect(app.lastRequest.query.include).toStrictEqual('id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.collection('Customers')
        .get(1, {pick: ['id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['pick']);
    expect(app.lastRequest.query.pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.collection('Customers')
        .get(1, {omit: ['id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['omit']);
    expect(app.lastRequest.query.omit).toStrictEqual('id,givenName');
  });

});
