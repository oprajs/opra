import { OpraDocument } from '@opra/schema';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import { OpraClient } from '../src/client.js';
import { CollectionNode, SingletonNode } from '../src/index.js';

describe('OpraClient', function () {

  let document: OpraDocument;
  const serviceUrl = 'http://localhost';

  class MockClient extends OpraClient {
    protected async init(): Promise<void> {
      this._metadata = document;
    }
  }

  beforeAll(async () => {
    document = await createTestDocument();
  });

  it('Should create new instance', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(client).toBeDefined();
    expect(client.serviceUrl).toStrictEqual(serviceUrl);
  });

  it('Should retrieve metadata', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(client).toBeDefined();
    expect(client.metadata).toBeInstanceOf(OpraDocument);
  });

  it('Should "collection()" create a service for Collection resources', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(client).toBeDefined();
    expect(client.collection('Customers')).toBeInstanceOf(CollectionNode);
  });

  it('Should "singleton()" create a service for Singleton resources', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(client).toBeDefined();
    expect(client.singleton('BestCustomer')).toBeInstanceOf(SingletonNode);
  });

  it('Should check if Collection resource exists', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(() => client.collection('blabla')).toThrow('does not exists');
  });

  it('Should .collection() check if resource is CollectionResource', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(() => client.collection('BestCustomer')).toThrow('s not a CollectionResource');
  });

  it('Should check if Singleton resource exists', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(() => client.singleton('blabla')).toThrow('does not exists');
  });

  it('Should .singleton() check if resource is SingletonResource', async () => {
    const client = await MockClient.create(serviceUrl);
    expect(() => client.singleton('Customers')).toThrow('s not a SingletonResource');
  });

});
