import { ApiDocument, DocumentFactory, HttpRequestMessage } from '@opra/common';
import { OpraHttpAdapter, Request } from '@opra/core';
import { Eq, Field } from '@sqb/builder';
import { BestCustomerResource } from '../../core/test/_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../core/test/_support/test-app/resource/customers.resource.js';
import { SQBAdapter } from '../src/index.js';

describe('SQBAdapter.parseRequest', function () {

  class TestHttpAdapter extends OpraHttpAdapter {
    platform = 'test';

    static async create(doc: ApiDocument, options?: OpraHttpAdapter.Options): Promise<TestHttpAdapter> {
      const adapter1 = new TestHttpAdapter(doc);
      await adapter1.init(options);
      return adapter1;
    }

    async parseRequest(incoming: HttpRequestMessage): Promise<Request> {
      return super.parseRequest(incoming);
    }
  }

  let document: ApiDocument;
  let adapter: TestHttpAdapter;

  beforeAll(async () => {
    document = await DocumentFactory.createDocument({
      version: '1.0',
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [CustomersResource, BestCustomerResource]
    });
    adapter = await TestHttpAdapter.create(document);
  });

  describe('CollectionCreateQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers',
        body: values,
        headers: {'content-type': 'application/json'}
      }));

      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$pick=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$omit=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$include=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'address.city']);
    });

  });


  describe('CollectionDeleteQuery', function () {
    it('Should prepare', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'DELETE',
        url: '/Customers@1'
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('destroy');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toBeDefined();
    });
  });

  describe('CollectionDeleteManyQuery', function () {

    it('Should prepare', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'DELETE',
        url: '/Customers'
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "filter" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'DELETE',
        url: '/Customers?$filter=givenname=John'
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
      expect(o.options.filter).toStrictEqual(Eq(Field('givenName'), 'John'));
    })
  });


  describe('CollectionGetQuery', function () {

    it('Should prepare', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1'
      }));

      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$pick=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "omit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$omit=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "include" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$include=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'address.city']);
    });

  });


  describe('CollectionUpdateQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1',
        body: values,
        headers: {'content-type': 'application/json'}
      }));

      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$pick=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$omit=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$include=id,givenname,address.city',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'address.city']);
    });

  });

  describe('CollectionUpdateManyQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "filter" option', async () => {
      const values = {a: 1};
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers?$filter=givenname=John',
        body: values,
        headers: {'content-type': 'application/json'}
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
      expect(o.options.filter).toStrictEqual(Eq(Field('givenName'), 'John'));
    })

  });

  describe('CollectionSearchQuery', function () {

    it('Should prepare', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers'
      }));

      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$pick=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "omit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$omit=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "include" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$include=id,givenname,address.city',
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'address.city']);
    });

    it('Should prepare with "filter" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$filter=givenname=John'
      }));
      const o = SQBAdapter.parseRequest(request);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
      expect(o.options.filter).toStrictEqual(Eq(Field('givenName'), 'John'));
    })

  });


});

