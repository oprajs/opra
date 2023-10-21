import { HttpEventType, HttpObserveType, HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Singleton.update', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {_id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
  });

  it('Should return body if observe=body or undefined', async () => {
    const body = await client.singleton('auth/MyProfile')
        .update(data)
        .getBody();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile');
    expect(body.payload).toMatchObject({
      _id: 1
    });
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.singleton('auth/MyProfile')
        .update(data)
        .getResponse();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = [ 'Sent', 'ResponseHeader', 'Response'];
    const receivedEvents: HttpEventType[] = [];
    client.singleton('auth/MyProfile')
        .update(data)
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

  it('Should send request with "include" param', async () => {
    await client.singleton('auth/MyProfile')
        .update(data, {include: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile?include=_id%2CgivenName');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['include']);
    expect(app.lastRequest.query.include).toStrictEqual('_id,givenName');
  });

  it('Should send request with "pick" param', async () => {
    await client.singleton('auth/MyProfile')
        .update(data, {pick: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile?pick=_id%2CgivenName');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['pick']);
    expect(app.lastRequest.query.pick).toStrictEqual('_id,givenName');
  });

  it('Should send request with "omit" param', async () => {
    await client.singleton('auth/MyProfile')
        .update(data, {omit: ['_id', 'givenName']})
        .toPromise();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.url).toStrictEqual('/auth/MyProfile?omit=_id%2CgivenName');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['omit']);
    expect(app.lastRequest.query.omit).toStrictEqual('_id,givenName');
  });

});
