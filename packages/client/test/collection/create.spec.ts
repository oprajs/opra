import { lastValueFrom } from 'rxjs';
import { HttpHeaderCodes, OpraSchema } from '@opra/common';
import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.create', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {_id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.collection('Customers')
        .create(data)
        .getResponse();
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual(OpraSchema.SpecVersion);
  });

  it('Should return body if observe=body', async () => {
    const create = client.collection('Customers').create(data);
    let body = await lastValueFrom(create);
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(body.type).toStrictEqual('Customer');
    expect(body.payload).toEqual(data);
    body = await create.getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(body.payload).toEqual(data);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .create(data)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
    expect(resp.body.context).toEqual('/Customers');
    expect(resp.body.type).toEqual('Customer');
    expect(resp.body.payload).toEqual(data);
    expect(resp.body.affected).toEqual(1);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = [ 'Sent', 'ResponseHeader', 'Response'];
    const receivedEvents: HttpEventType[] = [];
    client.collection('Customers')
        .create(data)
        .observe(HttpObserveType.Events)
        .subscribe({
          next: (event) => {
            receivedEvents.push(event.type);
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

  it('Should emit UploadProgress event reportProgress=true', (done) => {
    let progressEvent = 0;
    let loaded = 0;
    let total = 0;
    client.collection('Customers')
        .create(data)
        .options({reportProgress: true})
        .observe(HttpObserveType.Events)
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              progressEvent++;
              loaded = event.loaded;
              total = event.total || 0;
            }
          },
          complete: () => {
            try {
              expect(progressEvent).toBeGreaterThan(0);
              expect(loaded).toBeGreaterThan(0);
              expect(total).toBeGreaterThan(0);
              expect(loaded).toEqual(total);
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
        .create(data, {include: ['_id', 'givenName']})
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers?include=_id%2CgivenName');
    expect(app.lastRequest.query.include).toStrictEqual('_id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.collection('Customers')
        .create(data, {pick: ['_id', 'givenName']})
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers?pick=_id%2CgivenName');
    expect(app.lastRequest.query.pick).toStrictEqual('_id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.collection('Customers')
        .create(data, {omit: ['_id', 'givenName']})
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.url).toStrictEqual('/Customers?omit=_id%2CgivenName');
    expect(app.lastRequest.query.omit).toStrictEqual('_id,givenName');
  });

});
