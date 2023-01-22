import express from 'express';
import supertest from 'supertest';
import { jest } from '@jest/globals'
import { OpraDocument } from '@opra/common';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('CollectionResource', function () {

  const app = express();
  const client = supertest(app);
  let document: OpraDocument;
  let adapter: OpraExpressAdapter;
  let customersResource;
  const data = {
    id: 1001,
    givenName: 'abcd',
    familyName: 'efgh',
  }

  beforeAll(async () => {
    document = await createTestDocument();
    adapter = await OpraExpressAdapter.init(app, document);
    customersResource = document.getCollectionResource('customers');
  });

  afterAll(async () => {
    await adapter.close();
  })

  describe('"init" handler', function () {
    it('Should call "init" on adapter initialization', async () => {
      // let ctx;
      // const mockFn = jest.spyOn(customersResource.instance, 'init').mockImplementation((c) => ctx = c);
      // mockFn.mockRestore();
    });
  })

  describe('"create" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.create, 'handler').mockImplementation((c) => ctx = c);
      await client.post('/Customers').send(data);
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('create');
      expect(ctx.query.operation).toStrictEqual('create');
      expect(ctx.query.resource).toBe(customersResource);
      expect(ctx.query.data).toEqual(data);
      mockFn.mockRestore();
    });

    it('Should parse "$pick" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.create, 'handler').mockImplementation((c) => ctx = c);
      await client.post('/Customers?$pick=id,gender').send(data);
      expect(ctx.query.pick).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$omit" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.create, 'handler').mockImplementation((c) => ctx = c);
      await client.post('/Customers?$omit=id,gender').send(data);
      expect(ctx.query.omit).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$include" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.create, 'handler').mockImplementation((c) => ctx = c);
      await client.post('/Customers?$include=id,gender').send(data);
      expect(ctx.query.include).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });
  });


  describe('"delete" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.delete, 'handler').mockImplementation((c) => ctx = c);
      await client.delete('/Customers@1');
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('delete');
      expect(ctx.query.operation).toStrictEqual('delete');
      expect(ctx.query.resource).toBe(customersResource);
      expect(ctx.query.keyValue).toEqual(1);
      mockFn.mockRestore();
    });

  });


  describe('"deleteMany" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.deleteMany, 'handler').mockImplementation((c) => ctx = c);
      await client.delete('/Customers');
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('deleteMany');
      expect(ctx.query.operation).toStrictEqual('delete');
      expect(ctx.query.resource).toBe(customersResource);
      mockFn.mockRestore();
    });

    it('Should parse "$filter" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.deleteMany, 'handler').mockImplementation((c) => ctx = c);
      await client.delete('/Customers?$filter=deleted=true');
      expect(ctx.query.filter).toBeDefined();
      expect(ctx.query.filter.toString()).toStrictEqual('deleted=true');
      mockFn.mockRestore();
    });

  });


  describe('"get" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.get, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers@1');
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('get');
      expect(ctx.query.operation).toStrictEqual('read');
      expect(ctx.query.resource).toBe(customersResource);
      expect(ctx.query.keyValue).toEqual(1);
      mockFn.mockRestore();
    });

    it('Should parse "$pick" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.get, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers@1?$pick=id,gender');
      expect(ctx.query.pick).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$omit" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.get, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers@1?$omit=id,gender');
      expect(ctx.query.omit).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$include" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.get, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers@1?$include=id,gender');
      expect(ctx.query.include).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });
  });


  describe('"search" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers');
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('search');
      expect(ctx.query.operation).toStrictEqual('read');
      expect(ctx.query.resource).toBe(customersResource);
      mockFn.mockRestore();
    });

    it('Should parse "$pick" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$pick=id,gender');
      expect(ctx.query.pick).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$omit" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$omit=id,gender');
      expect(ctx.query.omit).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$include" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$include=id,gender');
      expect(ctx.query.include).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$filter" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$filter=deleted=true');
      expect(ctx.query.filter).toBeDefined();
      expect(ctx.query.filter.toString()).toStrictEqual('deleted=true');
      mockFn.mockRestore();
    });

    it('Should parse "$limit" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$limit=10');
      expect(ctx.query.limit).toStrictEqual(10);
      mockFn.mockRestore();
    });

    it('Should parse "$skip" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$skip=10');
      expect(ctx.query.skip).toStrictEqual(10);
      mockFn.mockRestore();
    });

    it('Should parse "$distinct" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$distinct=true');
      expect(ctx.query.distinct).toStrictEqual(true);
      await client.get('/Customers?$distinct=false');
      expect(ctx.query.distinct).toStrictEqual(false);
      mockFn.mockRestore();
    });

    it('Should parse "$count" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$count=true');
      expect(ctx.query.count).toStrictEqual(true);
      await client.get('/Customers?$count=false');
      expect(ctx.query.count).toStrictEqual(false);
      mockFn.mockRestore();
    });

    it('Should parse "$sort" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.search, 'handler').mockImplementation((c) => ctx = c);
      await client.get('/Customers?$sort=id,gender');
      expect(ctx.query.sort).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

  });


  describe('"update" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.update, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers@1').send(data);
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('update');
      expect(ctx.query.operation).toStrictEqual('update');
      expect(ctx.query.resource).toBe(customersResource);
      expect(ctx.query.keyValue).toEqual(1);
      expect(ctx.query.data).toEqual(data);
      mockFn.mockRestore();
    });

    it('Should parse "$pick" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.update, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers@1?$pick=id,gender').send(data);
      expect(ctx.query.pick).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$omit" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.update, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers@1?$omit=id,gender').send(data);
      expect(ctx.query.omit).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });

    it('Should parse "$include" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.update, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers@1?$include=id,gender').send(data);
      expect(ctx.query.include).toStrictEqual(['id', 'gender']);
      mockFn.mockRestore();
    });
  });

  describe('"updateMany" handler', function () {

    it('Should call handler', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.updateMany, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers').send(data);
      expect(ctx).toBeDefined();
      expect(ctx.query).toBeDefined();
      expect(ctx.query.method).toStrictEqual('updateMany');
      expect(ctx.query.operation).toStrictEqual('update');
      expect(ctx.query.resource).toBe(customersResource);
      expect(ctx.query.data).toEqual(data);
      mockFn.mockRestore();
    });


    it('Should parse "$filter" parameter', async () => {
      let ctx;
      const mockFn = jest.spyOn(customersResource.updateMany, 'handler').mockImplementation((c) => ctx = c);
      await client.patch('/Customers?$filter=deleted=true').send(data);
      expect(ctx.query.filter).toBeDefined();
      expect(ctx.query.filter.toString()).toStrictEqual('deleted=true');
      mockFn.mockRestore();
    });
  });

});
