import { faker } from '@faker-js/faker';
import { ResourceNotAvailableError } from '@opra/common';
import { MongoSingletonService } from '@opra/mongodb';
import { CustomerApplication } from 'express-mongo';
import { createContext } from '../_support/create-context.js';

describe('MongoSingletonService', () => {
  let app: CustomerApplication;
  let service: MongoSingletonService<any>;
  let tempRecord: any;
  const interceptorFn = fn => fn();

  beforeAll(async () => {
    app = await CustomerApplication.create();
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

  describe('assert()', () => {
    it('Should not throw if document exists', async () => {
      const ctx = createContext(app.adapter);
      await service.for(ctx).assert();
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      service._id = 99;
      await expect(() => service.for(ctx).assert()).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx, { documentFilter: 'rate=99' }).assert()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });
  });

  describe('findOne()', () => {
    it('Should return single document', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find();
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: 5,
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({ filter: { _id: 9999 } });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({
        filter: 'rate>5',
      });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      jest.spyOn(service as any, '_getDocumentFilter').mockResolvedValueOnce('_id=2');
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx, { documentFilter: '_id=2' }).find();
      expect(result).not.toBeDefined();
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({
        projection: ['+address'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({
        projection: ['rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).not.toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({
        projection: ['-rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).not.toBeDefined();
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.find();
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('get()', () => {
    it('Should return single document', async () => {
      const ctx = createContext(app.adapter);
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
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).get()).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply filter returned by documentFilter', async () => {
      jest.spyOn(service as any, '_getDocumentFilter').mockResolvedValueOnce('rate=999');
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx, { documentFilter: 'rate=99' }).get()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.get();
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('create()', () => {
    it('Should insert document', async () => {
      service._id = 2;
      const ctx = createContext(app.adapter);
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service.for(ctx).create(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).get();
      expect(result).toEqual(r);
    });

    it('Should run interceptors', async () => {
      service._id = 3;
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service.for(ctx, { interceptor: mockFn }).create(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('updateOnly()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx).updateOnly(doc);
      expect(result).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      service._id = 99;
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx).updateOnly(doc);
      expect(result).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx, { documentFilter: 'rate=99' }).updateOnly(doc);
      expect(result).toEqual(0);
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.updateOnly(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('update()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result: any = await service.for(ctx).update(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).find();
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      service._id = 99;
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).update(doc);
      expect(r).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result = await service.for(ctx, { documentFilter: 'rate=999' }).update(doc);
      expect(result).not.toBeDefined();
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const newService = service.for(ctx, { interceptor: mockFn });
      const result: any = await newService.update(doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('delete()', () => {
    it('Should return "0" if parent record not found', async () => {
      service._id = 99;
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).delete();
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx, { documentFilter: 'rate=999' }).delete();
      expect(result).toEqual(0);
    });

    it('Should delete document', async () => {
      const ctx = createContext(app.adapter);
      let r = await service.for(ctx).find();
      expect(r).toBeDefined();

      const result: any = await service.for(ctx).delete();
      expect(result).toEqual(1);

      r = await service.for(ctx).find();
      expect(r).not.toBeDefined();
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      await newService.delete();
      expect(mockFn).toBeCalled();
    });
  });
});
