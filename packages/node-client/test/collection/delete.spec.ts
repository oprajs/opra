import { HttpResponse } from '@opra/common';
import { OpraHttpClient } from '../../src/index.js';
import { createMockServer } from '../_support/create-mock-server.js';

describe('Collection.delete', function () {

  let app;
  let client: OpraHttpClient;

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = app.client;
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .delete(1).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(resp).toEqual(app.respBody);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .delete(1).fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@1');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.collection('Customers').delete(1, {observe: 'events'}).subscribe({
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

  it('Should send "delete" request with multiple keys', async () => {
    await client.collection('Customers')
        .delete({id: 1, active: true}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('DELETE');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers@id=1;active=true');
  });

});
