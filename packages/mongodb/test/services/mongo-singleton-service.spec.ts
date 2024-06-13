import { faker } from '@faker-js/faker';
import { ResourceNotAvailableError } from '@opra/common';
import { MongoSingletonService } from '@opra/mongodb';
import { TestApp } from '../_support/test-app/index.js';

describe('MongoSingletonService', function () {
  let app: TestApp;
  let service: MongoSingletonService<any>;
  let tempRecord: any;
  const interceptorFn = fn => fn();

  beforeAll(async () => {
    app = await TestApp.create();
    service = new MongoSingletonService<any>('Customer', {
      db: app.db,
      collectionName: 'MongoSingletonService',
      _id: 1,
    });
    tempRecord = {
      _id: 1,
      uid: faker.string.uuid(),
      active: faker.datatype.boolean(),
      countryCode: faker.location.countryCode(),
      rate: 5,
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      address: {
        city: faker.location.city(),
      },
    };
    const collection = app.db.collection('MongoSingletonService');
    await collection.deleteMany();
    await collection.insertOne(tempRecord);
  });

  afterAll(async () => {
    await app?.close();
  });

  afterAll(() => global.gc && global.gc());
  beforeEach(() => (service._id = 1));

  describe('assert()', function () {
    it('Should not throw if document exists', async () => {
      const ctx = await app.createContext();
      await service.for(ctx).assert();
    });

    it('Should throw error if not found', async () => {
      const ctx = await app.createContext();
      service._id = 99;
      await expect(() => service.for(ctx).assert()).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = await app.createContext();
      await expect(() => service.for(ctx, { $documentFilter: 'rate=99' }).assert()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });
  });

  describe('findOne()', function () {
    it('Should return single document', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne();
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: 5,
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne({ filter: { _id: 9999 } });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne({
        filter: 'rate>5',
      });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      jest.spyOn(service as any, '_getDocumentFilter').mockResolvedValueOnce('_id=2');
      const ctx = await app.createContext();
      const result: any = await service.for(ctx, { $documentFilter: '_id=2' }).findOne();
      expect(result).not.toBeDefined();
    });

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne({
        projection: ['+address'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne({
        projection: ['rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).not.toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).findOne({
        projection: ['-rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).not.toBeDefined();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const result = await service.for(ctx, { $interceptor: mockFn }).findOne();
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('get()', function () {
    it('Should return single document', async () => {
      const ctx = await app.createContext();
      const result: any = await service.for(ctx).get();
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should throw error if not found', async () => {
      service._id = 99;
      const ctx = await app.createContext();
      await expect(() => service.for(ctx).get()).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply filter returned by documentFilter', async () => {
      jest.spyOn(service as any, '_getDocumentFilter').mockResolvedValueOnce('rate=999');
      const ctx = await app.createContext();
      await expect(() => service.for(ctx, { $documentFilter: 'rate=99' }).get()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const result = await service.for(ctx, { $interceptor: mockFn }).get();
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('create()', function () {
    it('Should insert document', async () => {
      service._id = 2;
      const ctx = await app.createContext();
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service.for(ctx).create(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).get();
      expect(result).toEqual(r);
    });

    it('Should run in interceptor', async () => {
      service._id = 3;
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service.for(ctx, { $interceptor: mockFn }).create(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('updateOnly()', function () {
    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx).updateOnly(doc);
      expect(result).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      service._id = 99;
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx).updateOnly(doc);
      expect(result).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx, { $documentFilter: 'rate=99' }).updateOnly(doc);
      expect(result).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx, { $interceptor: mockFn }).updateOnly(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('update()', function () {
    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result: any = await service.for(ctx).update(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).findOne();
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      service._id = 99;
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).update(doc);
      expect(r).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx, { $documentFilter: 'rate=999' }).update(doc);
      expect(result).not.toBeDefined();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const doc = { uid: faker.string.uuid() };
      const result: any = await service.for(ctx, { $interceptor: mockFn }).update(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('delete()', function () {
    it('Should return "0" if parent record not found', async () => {
      service._id = 99;
      const ctx = await app.createContext();
      const r = await service.for(ctx).delete();
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = await app.createContext();
      const result = await service.for(ctx, { $documentFilter: 'rate=999' }).delete();
      expect(result).toEqual(0);
    });

    it('Should delete document', async () => {
      const ctx = await app.createContext();
      let r = await service.for(ctx).findOne();
      expect(r).toBeDefined();

      const result: any = await service.for(ctx).delete();
      expect(result).toEqual(1);

      r = await service.for(ctx).findOne();
      expect(r).not.toBeDefined();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = await app.createContext();
      const r = await service.for(ctx, { $interceptor: mockFn }).delete();
      expect(r).toEqual(0);
      expect(mockFn).toBeCalled();
    });
  });
});
