import { HttpHeaderCodes } from '@opra/common';
import { customersData } from '../../../../support/test/customers.data.js';
import { HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Singleton.update', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {id: 1, givenName: 'dfd'};
  const rows: any[] = JSON.parse(JSON.stringify(customersData.slice(0, 1)));

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Opra_Total_Matches, '10');
      res.header(HttpHeaderCodes.X_Opra_Version, '1');
      res.header(HttpHeaderCodes.X_Opra_Data_Type, 'Customer');
      res.json(rows[0]);
    })
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.singleton('MyProfile')
        .update(data).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/MyProfile');
    expect(resp).toEqual(rows[0]);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.singleton('MyProfile')
        .update(data).fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/MyProfile');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.singleton('MyProfile').update(data, {observe: 'events'}).subscribe({
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
    await client.singleton('MyProfile')
        .update(data, {include: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/MyProfile');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$include']);
    expect(app.lastRequest.query.$include).toStrictEqual('id,givenName');
  });

  it('Should send request with "$pick" param', async () => {
    await client.singleton('MyProfile')
        .update(data, {pick: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/MyProfile');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$pick']);
    expect(app.lastRequest.query.$pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "$omit" param', async () => {
    await client.singleton('MyProfile')
        .update(data, {omit: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('PATCH');
    expect(app.lastRequest.baseUrl).toStrictEqual('/MyProfile');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$omit']);
    expect(app.lastRequest.query.$omit).toStrictEqual('id,givenName');
  });

});
