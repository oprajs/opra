import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { customersData } from '../../../../support/test/customers.data.js';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.findMany', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const rows: any[] = JSON.parse(JSON.stringify(customersData.slice(0, 100)));

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      res.header(HttpHeaderCodes.Content_Type, 'application/opra+json');
      res.json({
        totalCount: 10,
        data: rows.slice(0, 10)
      });
    })
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.collection('Customers')
        .findMany()
        .getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .findMany()
        .getData();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toMatchObject({
      data: rows.slice(0, 10)
    });
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .findMany()
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'response-header', 'response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers')
        .findMany()
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
        .findMany({
          include: ['id', 'givenName']
        }).getData();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['include']);
    expect(app.lastRequest.query.include).toStrictEqual('id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.collection('Customers')
        .findMany({
          pick: ['id', 'givenName']
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['pick']);
    expect(app.lastRequest.query.pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.collection('Customers')
        .findMany({
          omit: ['id', 'givenName']
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['omit']);
    expect(app.lastRequest.query.omit).toStrictEqual('id,givenName');
  });

  it('Should send request with "sort" param', async () => {
    await client.collection('Customers')
        .findMany({
          sort: ['id', 'givenName']
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['sort']);
    expect(app.lastRequest.query.sort).toStrictEqual('id,givenName');
  });

  it('Should send request with "filter" param', async () => {
    await client.collection('Customers')
        .findMany({
          filter: 'id=1'
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['filter']);
    expect(app.lastRequest.query.filter).toStrictEqual('id=1');
  });

  it('Should send request with "limit" param', async () => {
    await client.collection('Customers')
        .findMany({
          limit: 5
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['limit']);
    expect(app.lastRequest.query.limit).toStrictEqual('5');
  });

  it('Should send request with "skip" param', async () => {
    await client.collection('Customers')
        .findMany({
          skip: 5
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['skip']);
    expect(app.lastRequest.query.skip).toStrictEqual('5');
  });

  it('Should send request with "count" param', async () => {
    const resp = await client.collection('Customers')
        .findMany({
          count: true
        }).getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['count']);
    expect(app.lastRequest.query.count).toStrictEqual('true');
    expect(resp.totalCount).toStrictEqual(10);
  });

});
