import { AxiosRequestConfig } from 'axios';
import type { Customer } from '@opra/core/test/_support/test-app/entities/customer.entity';
import { OpraDocument } from '@opra/schema';
import { OpraURLSearchParams } from '@opra/url';
import { createTestDocument } from '../../core/test/_support/test-app/create-service.js';
import { OpraClient } from '../src/client.js';

describe('OpraClient:SingletonService', function () {

  let document: OpraDocument;
  const serviceUrl = 'http://localhost';

  class MockClient extends OpraClient {
    protected async _fetchMetadata(): Promise<void> {
      this._metadata = document;
    }
  }

  let req!: AxiosRequestConfig;
  jest.spyOn<MockClient, any>(MockClient.prototype, '_send')
      .mockImplementation(async (r: any) => {
        req = r;
      });

  beforeAll(async () => {
    document = await createTestDocument();
  });


  describe('"get" request', function () {
    it('Should send "get" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.singleton<Customer>('BestCustomer').get();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.url).toStrictEqual(client.serviceUrl + '/BestCustomer');
    });

    it('Should return Observable', (done) => {
      MockClient.create(serviceUrl)
          .then((client: OpraClient) => {
            client.singleton<Customer>('BestCustomer').get().subscribe({
              next: () => {
                expect(req).toBeDefined();
                expect(req.method).toStrictEqual('GET');
                expect(req.url).toStrictEqual(client.serviceUrl + '/BestCustomer');
              },
              complete: () => done()
            });
          })
          .catch(done);
    });

    it('Should send "get" request with "$include" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.singleton('BestCustomer').get({include: ['id', 'givenName']});
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.url).toStrictEqual(client.serviceUrl + '/BestCustomer');
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$include']);
      expect(req.params.get('$include')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "get" request with "$pick" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.singleton('BestCustomer').get({pick: ['id', 'givenName']});
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.url).toStrictEqual(client.serviceUrl + '/BestCustomer');
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$pick']);
      expect(req.params.get('$pick')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "get" request with "$omit" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.singleton('BestCustomer').get({omit: ['id', 'givenName']});
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.url).toStrictEqual(client.serviceUrl + '/BestCustomer');
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$omit']);
      expect(req.params.get('$omit')).toStrictEqual(['id', 'givenName']);
    });
  })

});
