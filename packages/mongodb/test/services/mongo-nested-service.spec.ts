import { faker } from '@faker-js/faker';
import { ResourceNotAvailableError } from '@opra/common';
import { MongoNestedService } from '@opra/mongodb';
import { CustomerApplication } from 'express-mongo';
import { createContext } from '../_support/create-context.js';

describe('MongoNestedService', () => {
  let app: CustomerApplication;
  let service: MongoNestedService<any>;
  const tempRecords: any[] = [];
  const interceptorFn = fn => fn();

  beforeAll(async () => {
    app = await CustomerApplication.create();
    service = new MongoNestedService<any>('Customer', 'notes', {
      db: app.db,
      collectionName: 'MongoNestedService',
    });

    for (let i = 1; i <= 10; i++) {
      const record: any = {
        _id: i,
        name: {
          given: faker.person.firstName(),
          family: faker.person.lastName(),
        },
        notes: [],
      };
      for (let k = 1; k <= 10; k++) {
        record.notes.push({
          _id: k,
          title: faker.lorem.sentence(5),
          text: faker.lorem.text(),
          largeContent: faker.lorem.text(),
          rank: k,
        });
      }
      tempRecords.push(record);
    }
    const collection = app.db.collection('MongoNestedService');
    await collection.deleteMany();
    await collection.insertMany(tempRecords);
  });

  afterAll(async () => {
    await app?.close();
  });

  afterAll(() => global.gc && global.gc());

  describe('assert()', () => {
    it('Should not throw if document exists', async () => {
      const ctx = createContext(app.adapter);
      await service.for(ctx).assert(1, 1);
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).assert(9999, 1)).rejects.toThrow(
        ResourceNotAvailableError,
      );
      await expect(() => service.for(ctx).assert(1, 99)).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { documentFilter: '_id=2' }).assert(1, 1),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { nestedFilter: () => 'rank=99' }).assert(1, 1),
      ).rejects.toThrow(ResourceNotAvailableError);
    });
  });

  describe('count()', () => {
    it('Should count number of elements in array field', async () => {
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx).count(1);
      expect(result).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result1 = await service.for(ctx).count(1);
      const result2 = await service
        .for(ctx)
        .count(1, { filter: { rank: { $gt: 5 } } });
      expect(result1).toBeGreaterThan(result2);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: '_id=2' })
        .count(1);
      expect(result).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { nestedFilter: 'rank=2' })
        .count(1);
      expect(result).toEqual(1);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx, { interceptor: mockFn }).count(1);
      expect(result).toBeGreaterThan(0);
      expect(mockFn).toBeCalled();
    });
  });

  describe('findById()', () => {
    it('Should return single object', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findById(1, 1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should return undefined if not found', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).findById(1, 9999);
      expect(r).not.toBeDefined();
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: '_id=2' })
        .findById(1, 1);
      expect(result).not.toBeDefined();
    });

    it('Should apply filter returned by nestedFilter()', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { nestedFilter: () => 'rank=99' })
        .findById(1, 1);
      expect(result).not.toBeDefined();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findById(1, 1);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('findOne()', () => {
    it('Should return single object', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne(1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx)
        .findOne(1, { filter: { _id: 9999 } });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne(1, {
        filter: { rank: { $gt: 5 } },
      });
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
      expect(result.rank).toBeGreaterThan(5);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { documentFilter: '_id=2' })
        .findOne(1);
      expect(result).not.toBeDefined();
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx)
        .for(ctx, { nestedFilter: 'rank=2' })
        .findOne(1);
      expect(result.rank).toEqual(2);
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne(1, {
        projection: ['+largeContent'],
      });
      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.largeContent).toBeDefined();
      expect(result.rank).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne(1, {
        projection: ['rank'],
      });
      expect(result).toBeDefined();
      expect(result.title).not.toBeDefined();
      expect(result.text).not.toBeDefined();
      expect(result.largeContent).not.toBeDefined();
      expect(result.rank).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findOne(1, {
        projection: ['-rank'],
      });
      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.largeContent).not.toBeDefined();
      expect(result.rank).not.toBeDefined();
    });

    it('Should return sorted', async () => {
      const ctx = createContext(app.adapter);
      const result1: any = await service.for(ctx).findOne(1, { sort: ['_id'] });
      const result2: any = await service
        .for(ctx)
        .findOne(1, { sort: ['-_id'] });
      expect(result1._id).toBeLessThan(result2._id);
    });

    it('Should skip records', async () => {
      const ctx = createContext(app.adapter);
      const result1: any = await service
        .for(ctx)
        .findOne(1, { skip: 1, sort: ['_id'] });
      const result2: any = await service
        .for(ctx)
        .findOne(1, { skip: 2, sort: ['_id'] });
      expect(result1._id).toBeLessThan(result2._id);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findOne(1);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('findMany()', () => {
    it('Should return objects', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1);
      expect(result).toBeDefined();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.anything(),
            text: expect.anything(),
            rank: expect.any(Number),
          }),
        ]),
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        filter: { rank: { $gt: 5 } },
      });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const r of result) expect(r.rank).toBeGreaterThan(5);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx)
        .for(ctx, { documentFilter: '_id=2' })
        .findMany(1);
      expect(result.length).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { nestedFilter: 'rank=2' })
        .findMany(1);
      expect(result.length).toEqual(1);
      expect(result[0].rank).toEqual(2);
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        projection: ['+largeContent'],
      });
      expect(result.length).toBeGreaterThan(0);
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.title).toBeDefined();
        expect(r.text).toBeDefined();
        expect(r.largeContent).toBeDefined();
        expect(r.rank).toBeGreaterThan(0);
      }
    });

    it('Should pick fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        projection: ['rank'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.title).not.toBeDefined();
        expect(r.text).not.toBeDefined();
        expect(r.largeContent).not.toBeDefined();
        expect(r.rank).toBeGreaterThan(0);
      }
    });

    it('Should omit fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        projection: ['-rank'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.title).toBeDefined();
        expect(r.text).toBeDefined();
        expect(r.largeContent).not.toBeDefined();
        expect(r.rank).not.toBeDefined();
      }
    });

    it('Should include exclusive fields', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        projection: ['+largeContent'],
      });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.title).toBeDefined();
        expect(r.text).toBeDefined();
        expect(r.largeContent).toBeDefined();
        expect(r.rank).toBeGreaterThan(0);
      }
    });

    it('Should sort items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        sort: ['-rank'],
      });
      expect(result).toBeDefined();
      const original = result.map(x => x.rank);
      const sorted = [...original].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
      expect(original).toEqual(sorted);
    });

    it('Should limit retuning items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        limit: 2,
      });
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
    });

    it('Should skip items', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).findMany(1, {
        skip: 5,
        sort: ['_id'],
      });
      expect(result).toBeDefined();
      expect(result[0]._id).toBeGreaterThan(5);
    });

    it('Should count total matches', async () => {
      const ctx = createContext(app.adapter);
      const result = await service.for(ctx).findManyWithCount(1, {
        filter: { rank: { $gt: 5 } },
      });
      expect(result).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(5);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .findMany(1);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(mockFn).toBeCalled();
    });
  });

  describe('get()', () => {
    it('Should return single object', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).get(1, 1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).get(1, 9999)).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { documentFilter: '_id=999' }).get(1, 1),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { nestedFilter: 'rank=99' }).get(1, 1),
      ).rejects.toThrow(ResourceNotAvailableError);
    });
  });

  describe('create()', () => {
    it('Should insert object into array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { _id: 100, title: faker.lorem.text() };
      const result = await service.for(ctx).create(1, doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).findById(1, 100);
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      const ctx = createContext(app.adapter);
      const doc = { _id: 101, title: faker.lorem.text() };
      await expect(() => service.for(ctx).create(9999, doc)).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { _id: 101, title: faker.lorem.text() };
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .create(1, doc);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .get(1, 1);
      expect(result).toBeDefined();
      expect(mockFn).toBeCalled();
    });
  });

  describe('updateOnly()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { title: faker.lorem.text() };
      const srcDoc = tempRecords[5];
      const r = await service
        .for(ctx)
        .updateOnly(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(r).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = createContext(app.adapter);
      const doc = { title: faker.lorem.text() };
      const r = await service.for(ctx).updateOnly(9999, 1, doc);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { documentFilter: '_id=999' })
        .updateOnly(2, 1, doc);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { nestedFilter: 'rank=99' })
        .updateOnly(2, 1, doc);
      expect(r).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const srcDoc = tempRecords[5];
      const r = await service
        .for(ctx, { interceptor: mockFn })
        .updateOnly(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(r).toEqual(1);
      expect(mockFn).toBeCalled();
    });
  });

  describe('update()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { title: faker.lorem.text() };
      const srcDoc = tempRecords[5];
      const r = await service
        .for(ctx)
        .update(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(r).toBeDefined();
      const x = await service
        .for(ctx)
        .findById(srcDoc._id, srcDoc.notes[0]._id);
      expect(x).toEqual(r);
    });

    it('Should throw error if parent record not found', async () => {
      const ctx = createContext(app.adapter);
      const doc = { title: faker.lorem.text() };
      await expect(() => service.for(ctx).update(9999, 1, doc)).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      await expect(() =>
        service.for(ctx, { documentFilter: '_id=999' }).update(2, 1, doc),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should apply nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      await expect(() =>
        service.for(ctx, { nestedFilter: 'rank=99' }).update(2, 1, doc),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const srcDoc = tempRecords[5];
      await service
        .for(ctx, { interceptor: mockFn })
        .update(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(mockFn).toBeCalled();
    });
  });

  describe('updateMany()', () => {
    it('Should update all objects in the array field', async () => {
      const ctx = createContext(app.adapter);
      const update = { title: faker.lorem.text() };
      const r = await service.for(ctx).updateMany(tempRecords[3]._id, update);
      expect(r).toBeGreaterThan(0);
      const recs = await service.for(ctx).findMany(tempRecords[3]._id);
      expect(recs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: update.title,
          }),
        ]),
      );
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const update = { title: faker.lorem.text() };
      const r = await service
        .for(ctx)
        .updateMany(tempRecords[3]._id, update, { filter: 'rank>5' });
      expect(r).toBeGreaterThan(0);
      const recs = await service.for(ctx).findMany(tempRecords[3]._id);
      expect(recs).toBeDefined();
      for (const x of recs!) {
        if (x.rank <= 5) expect(x.title).not.toEqual(update.title);
        else expect(x.title).toEqual(update.title);
      }
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { documentFilter: '_id=999' })
        .updateMany(2, doc);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { nestedFilter: 'rank=99' })
        .updateMany(2, doc);
      expect(r).toEqual(0);
    });

    it('Should count exact number of updated items', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).updateMany(2, doc);
      expect(r).toBeGreaterThan(1);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const update = { uid: faker.string.uuid() };
      await service
        .for(ctx, { interceptor: mockFn })
        .updateMany(tempRecords[3]._id, update);
      expect(mockFn).toBeCalled();
    });
  });

  describe('delete()', () => {
    it('Should delete object from the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = tempRecords[0];
      let x = await service.for(ctx).findById(doc._id, doc.notes[0]._id);
      expect(x).toBeDefined();

      const r = await service.for(ctx).delete(doc._id, doc.notes[0]._id);
      expect(r).toEqual(1);

      x = await service.for(ctx).findById(doc._id, doc.notes[0]._id);
      expect(x).not.toBeDefined();
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).delete(9999, 1);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { documentFilter: '_id=999' })
        .delete(3, 1);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { nestedFilter: 'rank=99' })
        .delete(3, 1);
      expect(r).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = tempRecords[2];
      await service
        .for(ctx, { interceptor: mockFn })
        .delete(doc._id, doc.notes[0]._id);
      expect(mockFn).toBeCalled();
    });
  });

  describe('deleteMany()', () => {
    it('Should apply filter returned by documentFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { documentFilter: '_id=999' })
        .deleteMany(1);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by nestedFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx, { nestedFilter: 'rank=99' })
        .deleteMany(3);
      expect(r).toEqual(0);
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service
        .for(ctx)
        .deleteMany(tempRecords[1]._id, { filter: { rank: { $gt: 5 } } });
      expect(r).toBeGreaterThan(0);
      const c = await service.for(ctx).count(tempRecords[1]._id);
      expect(c).toBeGreaterThan(0);
    });

    it('Should delete all object from the array field', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).deleteMany(tempRecords[0]._id);
      expect(r).toBeGreaterThan(0);
      const c = await service.for(ctx).count(tempRecords[0]._id);
      expect(c).toEqual(0);
    });

    it('Should run in interceptor', async () => {
      const mockFn = jest.fn(interceptorFn);
      const ctx = createContext(app.adapter);
      await service.for(ctx, { interceptor: mockFn }).deleteMany(1);
      expect(mockFn).toBeCalled();
    });
  });
});
