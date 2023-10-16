import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.findMany', function () {

  let app: MockServer;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.collection('Customers')
        .findMany()
        .getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.collection('Customers')
        .findMany()
        .getBody();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(Array.isArray(body.payload)).toBeTruthy();
    expect(body.type).toStrictEqual('Customer');
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .findMany()
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
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
          include: ['_id', 'givenName']
        }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?include=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['include']);
    expect(app.lastRequest.query.include).toStrictEqual('_id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.collection('Customers')
        .findMany({
          pick: ['_id', 'givenName']
        }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?pick=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['pick']);
    expect(app.lastRequest.query.pick).toStrictEqual('_id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.collection('Customers')
        .findMany({
          omit: ['_id', 'givenName']
        }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?omit=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['omit']);
    expect(app.lastRequest.query.omit).toStrictEqual('_id,givenName');
  });

  it('Should send request with "sort" param', async () => {
    await client.collection('Customers')
        .findMany({
          sort: ['_id', 'givenName']
        }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?sort=_id%2CgivenName');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['sort']);
    expect(app.lastRequest.query.sort).toStrictEqual('_id,givenName');
  });

  it('Should send request with "filter" param', async () => {
    await client.collection('Customers')
        .findMany({
          filter: '_id=1'
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?filter=_id%3D1');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['filter']);
    expect(app.lastRequest.query.filter).toStrictEqual('_id=1');
  });

  it('Should send request with "limit" param', async () => {
    await client.collection('Customers')
        .findMany({
          limit: 5
        }).toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?limit=5');
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
    expect(app.lastRequest.url).toStrictEqual('/Customers?skip=5');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['skip']);
    expect(app.lastRequest.query.skip).toStrictEqual('5');
  });

  it('Should send request with "count" param', async () => {
    const body = await client.collection('Customers')
        .findMany({
          count: true
        }).getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.url).toStrictEqual('/Customers?count=true');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['count']);
    expect(app.lastRequest.query.count).toStrictEqual('true');
    expect(body.count).toStrictEqual(10);
    expect(body.totalMatches).toBeGreaterThan(10);
  });

});
