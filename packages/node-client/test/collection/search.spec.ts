import { HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer } from '../_support/create-mock-server.js';

describe('Collection.search', function () {

  let app;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = app.client;
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .search().fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toEqual(app.respBody);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .search().fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.collection('Customers').search({observe: 'events'}).subscribe({
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
    await client.collection('Customers')
        .search({
          include: ['id', 'givenName']
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$include']);
    expect(app.lastRequest.query.$include).toStrictEqual('id,givenName');
  });

  it('Should send request with "$pick" param', async () => {
    await client.collection('Customers')
        .search({
          pick: ['id', 'givenName']
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$pick']);
    expect(app.lastRequest.query.$pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "$omit" param', async () => {
    await client.collection('Customers')
        .search({
          omit: ['id', 'givenName']
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$omit']);
    expect(app.lastRequest.query.$omit).toStrictEqual('id,givenName');
  });

  it('Should send request with "$sort" param', async () => {
    await client.collection('Customers')
        .search({
          sort: ['id', 'givenName']
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$sort']);
    expect(app.lastRequest.query.$sort).toStrictEqual('id,givenName');
  });

  it('Should send request with "$filter" param', async () => {
    await client.collection('Customers')
        .search({
          filter: 'id=1'
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$filter']);
    expect(app.lastRequest.query.$filter).toStrictEqual('id=1');
  });

  it('Should send request with "$limit" param', async () => {
    await client.collection('Customers')
        .search({
          limit: 5
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$limit']);
    expect(app.lastRequest.query.$limit).toStrictEqual('5');
  });

  it('Should send request with "$skip" param', async () => {
    await client.collection('Customers')
        .search({
          skip: 5
        }).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('GET');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$skip']);
    expect(app.lastRequest.query.$skip).toStrictEqual('5');
  });

});
