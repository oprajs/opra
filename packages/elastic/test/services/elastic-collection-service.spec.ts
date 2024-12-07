import { faker } from '@faker-js/faker';
import { ResourceNotAvailableError } from '@opra/common';
import { Customer } from 'customer-elastic';
import { CustomerApplication } from 'express-elastic';
import { ElasticCollectionService } from '../../src/index.js';
import { createContext } from '../_support/create-context.js';

describe('ElasticCollectionService', () => {
  let app: CustomerApplication;
  let service: ElasticCollectionService<any>;
  const indexName = 'collection-test';
  const tempRecords: any[] = [];
  const interceptorFn = fn => fn();

  beforeAll(async () => {
    app = await CustomerApplication.create();
    /** Recreate index to be use in tests */
    const client = app.dbClient;
    service = new ElasticCollectionService<any>(Customer, {
      client,
      indexName,
    });
    if (await client.indices.exists({ index: indexName })) {
      await client.indices.delete({ index: indexName });
    }
    await client.indices.create({ index: indexName });
    for (let i = 1; i <= 20; i++) {
      const _id = String(i);
      const record: any = {
        id: i,
        uid: faker.string.uuid(),
        active: faker.datatype.boolean(),
        countryCode: faker.location.countryCode(),
        rate: i,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        address: {
          city: faker.location.city(),
        },
      };
      tempRecords.push({ _id, ...record });
      await client.index({
        index: 'collection-test',
        id: _id,
        document: record,
      });
    }
    await client.indices.refresh({ index: indexName });
  });

  afterAll(async () => {
    await app?.close();
  });

  afterAll(() => global.gc && global.gc());

  describe('assert()', () => {
    it('Should not throw if document exists', async () => {
      const ctx = createContext(app.adapter);
      await service.for(ctx).assert('1');
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).assert('9999')).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service
          .for(ctx, { documentFilter: () => 'countryCode="XYZ"' })
          .assert('1'),
      ).rejects.toThrow(ResourceNotAvailableError);
    });
  });

  describe('count()', () => {
    it('Should count number of documents', async () => {
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx).count();
      expect(result).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result1 = await service.for(ctx).count();
      const result2 = await service.for(ctx).count({ filter: 'rate>5' });
      expect(result1).toBeGreaterThan(result2);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: 'id=2' })
        .count();
      expect(result).toEqual(1);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx, { interceptor: mockFn }).count();
      expect(result).toBeGreaterThan(0);
      expect(mockFn).toBeCalled();
    });
  });

  describe('findById()', () => {
    it('Should return single object', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findById('1');
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: 1,
        rate: expect.any(Number),
      });
    });

    it('Should omit exclusive fields by default', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findById('1');
      expect(result).toBeDefined();
      expect(result.address).not.toBeDefined();
    });

    it('Should return undefined if not found', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).findById('9999');
      expect(r).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: 'id=2' })
        .findById('1');
      expect(result).not.toBeDefined();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findById('1');
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('findOne()', () => {
    it('Should return single document', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne();
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: '1',
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne({ filter: 'id=9999' });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne({
        filter: 'rate>5',
      });
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: expect.any(String),
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(5);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: 'id=2' })
        .findOne();
      expect(result._id).toEqual('2');
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne({
        projection: ['+address'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne({
        projection: ['rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).not.toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne({
        projection: ['-rate'],
      });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).not.toBeDefined();
    });

    it('Should return sorted', async () => {
      const ctx = createContext(app.adapter);
      const result1: any = await service.for(ctx).findOne({ sort: ['id'] });
      const result2: any = await service.for(ctx).findOne({ sort: ['-id'] });
      expect(result1.id).toBeLessThan(result2.id);
    });

    it('Should skip records', async () => {
      const ctx = createContext(app.adapter);
      const result1: any = await service
        .for(ctx)
        .findOne({ skip: 1, sort: ['id'] });
      const result2: any = await service
        .for(ctx)
        .findOne({ skip: 2, sort: ['id'] });
      expect(result1.id).toBeLessThan(result2.id);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findOne();
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('findMany()', () => {
    it('Should return documents', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany();
      expect(result).toBeDefined();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            rate: expect.any(Number),
          }),
        ]),
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        filter: 'rate>5',
      });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const r of result) expect(r.rate).toBeGreaterThan(5);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: 'id=2' })
        .findMany();
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(2);
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        projection: ['+address'],
      });
      expect(result.length).toBeGreaterThan(0);
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).toBeDefined();
        expect(r.address).toBeDefined();
        expect(r.rate).toBeGreaterThan(0);
      }
    });

    it('Should pick fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        projection: ['rate'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).not.toBeDefined();
        expect(r.address).not.toBeDefined();
        expect(r.rate).toBeGreaterThan(0);
      }
    });

    it('Should omit fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        projection: ['-rate'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).toBeDefined();
        expect(r.address).not.toBeDefined();
        expect(r.rate).not.toBeDefined();
      }
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        projection: ['+address'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).toBeDefined();
        expect(r.address).toBeDefined();
        expect(r.rate).toBeGreaterThan(0);
      }
    });

    it('Should sort items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        sort: ['-rate'],
      });
      expect(result).toBeDefined();
      const original = result.map(x => x.rate);
      const sorted = [...original].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
      expect(original).toEqual(sorted);
    });

    it('Should limit retuning items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        limit: 2,
      });
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
    });

    it('Should skip items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany({
        skip: 5,
        sort: ['id'],
      });
      expect(result).toBeDefined();
      expect(result[0].id).toBeGreaterThan(5);
    });
  });

  describe('findManyWithCount()', () => {
    it('Should count total matches', async () => {
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx).findManyWithCount({
        filter: 'rate>5',
        limit: 5,
      });
      expect(result).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.length).toBeLessThanOrEqual(5);
      expect(result.count).toBeGreaterThan(5);
      expect(result.count).toBeLessThan(20);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findMany();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(mockFn).toBeCalled();
    });
  });

  describe('get()', () => {
    it('Should return single document', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).get('1');
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: '1',
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).get('9999')).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { documentFilter: '_id=999' }).get('1'),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .get('1');
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('create()', () => {
    it('Should insert document', async () => {
      const ctx = createContext(app.adapter);
      const doc = { _id: '100', uid: faker.string.uuid() };
      const r = await service.for(ctx).create(doc);
      expect(r).toBeDefined();
      expect(r._id).toStrictEqual('100');
      expect(r.result).toStrictEqual('created');
    });

    it('Should run interceptors', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { _id: '101', uid: faker.string.uuid() };
      const r = await service.for(ctx, { interceptor: mockFn }).create(doc);
      expect(r).toBeDefined();
      expect(r._id).toStrictEqual('101');
      expect(r.result).toStrictEqual('created');
      expect(mockFn).toBeCalled();
    });
  });

  describe('update()', () => {
    beforeEach(() => app.dbClient.indices.refresh({ index: indexName }));

    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const srcDoc = tempRecords[3];
      const r = await service.for(ctx).update(srcDoc._id, doc);
      expect(r).toBeDefined();
      expect(r.updated).toStrictEqual(1);
      expect(r.total).toStrictEqual(1);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const srcDoc = tempRecords[4];
      const r = await service
        .for(ctx, { documentFilter: 'countryCode="XYZ"' })
        .update(srcDoc._id, doc);
      expect(r).toBeDefined();
      expect(r.updated).toStrictEqual(0);
      expect(r.total).toStrictEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const srcDoc = tempRecords[5];
      const r = await service
        .for(ctx, { interceptor: mockFn })
        .update(srcDoc._id, doc);
      expect(r).toBeDefined();
      expect(r.updated).toStrictEqual(1);
      expect(r.total).toStrictEqual(1);
      expect(mockFn).toBeCalled();
    });
  });

  describe('updateMany()', () => {
    beforeEach(() => app.dbClient.indices.refresh({ index: indexName }));

    it('Should update multiple records', async () => {
      const ctx = createContext(app.adapter);
      const update = { uid: faker.string.uuid() };
      const r = await service.for(ctx).updateMany(update);
      expect(r).toBeDefined();
      expect(r.updated).toBeGreaterThan(1);
      expect(r.total).toBeGreaterThan(1);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const update = { uid: faker.string.uuid() };
      const r: any = await service
        .for(ctx)
        .updateMany(update, { filter: 'rate<5' });
      expect(r).toBeDefined();
      expect(r.updated).toBeGreaterThan(1);
      expect(r.updated).toBeLessThan(5);
      expect(r.total).toBeGreaterThan(1);
      expect(r.total).toBeLessThan(5);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { documentFilter: 'countryCode="XYZ"' })
        .updateMany(doc);
      expect(r).toBeDefined();
      expect(r.updated).toStrictEqual(0);
      expect(r.total).toStrictEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const update = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { interceptor: mockFn })
        .updateMany(update);
      expect(r).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('delete()', () => {
    beforeEach(() => app.dbClient.indices.refresh({ index: indexName }));

    it('Should delete document', async () => {
      const ctx = createContext(app.adapter);
      const doc = tempRecords[0];
      let rec = await service.for(ctx).findById(doc._id);
      expect(rec).toBeDefined();

      const r = await service.for(ctx).delete(doc._id);
      expect(r.deleted).toEqual(1);
      await app.dbClient.indices.refresh({ index: indexName });

      rec = await service.for(ctx).findById(doc._id);
      expect(rec).not.toBeDefined();
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).delete('9999');
      expect(r).toBeDefined();
      expect(r.deleted).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { documentFilter: 'countryCode="XYZ"' })
        .delete('3');
      expect(r).toBeDefined();
      expect(r.deleted).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx, { interceptor: mockFn }).delete('0');
      expect(r).toBeDefined();
      expect(r.deleted).toEqual(0);
      expect(mockFn).toBeCalled();
    });
  });

  describe('deleteMany()', () => {
    beforeEach(() => app.dbClient.indices.refresh({ index: indexName }));

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { documentFilter: 'countryCode="XYZ"' })
        .deleteMany();
      expect(r).toBeDefined();
      expect(r.deleted).toEqual(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).deleteMany({ filter: 'rate>5' });
      expect(r.deleted).toBeGreaterThan(0);
      await app.dbClient.indices.refresh({ index: indexName });
      const c = await service.for(ctx).count();
      expect(c).toBeGreaterThan(0);
    });

    it('Should delete all object from the array field', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).deleteMany();
      expect(r.deleted).toBeGreaterThan(0);
      await app.dbClient.indices.refresh({ index: indexName });
      const c = await service.for(ctx).count();
      expect(c).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      await service.for(ctx, { interceptor: mockFn }).deleteMany();
      expect(mockFn).toBeCalled();
    });
  });
});
