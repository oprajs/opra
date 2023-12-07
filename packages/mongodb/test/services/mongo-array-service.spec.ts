import { faker } from '@faker-js/faker';
import { MongoArrayService } from '@opra/mongodb';
import { TestApp } from '../_support/test-app/index.js';

describe('MongoArrayService', function () {
  let app: TestApp;
  let service: MongoArrayService<any>;
  const tempRecords: any[] = [];

  beforeAll(async () => {
    app = await TestApp.create();
    service = new MongoArrayService<any>('Customer', 'notes', {
      db: app.db,
      collectionName: 'MongoArrayService'
    });

    for (let i = 1; i <= 10; i++) {
      const record: any = {
        _id: i,
        name: {
          given: faker.person.firstName(),
          family: faker.person.lastName()
        },
        notes: []
      }
      for (let k = 1; k <= 10; k++) {
        record.notes.push({
          _id: k,
          title: faker.lorem.sentence(5),
          text: faker.lorem.text(),
          largeContent: faker.lorem.text(),
          rank: k
        })
      }
      tempRecords.push(record);
    }
    const collection = app.db.collection('MongoArrayService');
    await collection.deleteMany();
    await collection.insertMany(tempRecords);
  });

  afterAll(async () => {
    await app?.close();
  })

  afterAll(() => global.gc && global.gc());


  describe('get()', function () {

    it('Should return single object', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .get(1, 1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should throw error if not found', async () => {
      const ctx = await app.createContext();
      await expect(() => service.forContext(ctx).get(1, 9999)).rejects
          .toThrow('NOT_FOUND')
    });

  });


  describe('findById()', function () {

    it('Should return single object', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findById(1, 1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should return undefined if not found', async () => {
      const ctx = await app.createContext();
      const r = await service.forContext(ctx).findById(1, 9999);
      expect(r).not.toBeDefined();
    });

  });


  describe('count()', function () {

    it('Should count number of elements in array field', async () => {
      const ctx = await app.createContext();
      const result = await service.forContext(ctx)
          .count(1);
      expect(result).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result1 = await service.forContext(ctx)
          .count(1);
      const result2 = await service.forContext(ctx)
          .count(1, {filter: {rank: {$gt: 5}}});
      expect(result1).toBeGreaterThan(result2);
    });

  });


  describe('findOne()', function () {

    it('Should return single object', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        title: expect.anything(),
        text: expect.anything(),
        rank: expect.any(Number),
      });
      expect(result.largeContent).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1, {filter: {_id: 9999}});
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1, {
            filter: {rank: {$gt: 5}}
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

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1, {
            include: ['largeContent']
          });
      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.largeContent).toBeDefined();
      expect(result.rank).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1, {
            pick: ['rank']
          });
      expect(result).toBeDefined();
      expect(result.title).not.toBeDefined();
      expect(result.text).not.toBeDefined();
      expect(result.largeContent).not.toBeDefined();
      expect(result.rank).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne(1, {
            omit: ['rank']
          });
      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.largeContent).not.toBeDefined();
      expect(result.rank).not.toBeDefined();
    });

    it('Should return sorted', async () => {
      const ctx = await app.createContext();
      const result1: any = await service.forContext(ctx)
          .findOne(1, {sort: ['_id']});
      const result2: any = await service.forContext(ctx)
          .findOne(1, {sort: ['-_id']});
      expect(result1._id).toBeLessThan(result2._id);
    });

    it('Should skip records', async () => {
      const ctx = await app.createContext();
      const result1: any = await service.forContext(ctx)
          .findOne(1, {skip: 1, sort: ['_id']});
      const result2: any = await service.forContext(ctx)
          .findOne(1, {skip: 2, sort: ['_id']});
      expect(result1._id).toBeLessThan(result2._id);
    });

  });


  describe('findMany()', function () {

    it('Should return objects', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1);
      expect(result).toBeDefined();
      expect(result).toEqual(
          expect.arrayContaining(
              [expect.objectContaining({
                title: expect.anything(),
                text: expect.anything(),
                rank: expect.any(Number),
              })]
          )
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            filter: {rank: {$gt: 5}}
          });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const r of result)
        expect(r.rank).toBeGreaterThan(5);
    });

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            include: ['largeContent']
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
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            pick: ['rank']
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
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            omit: ['rank']
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
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            include: ['largeContent']
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
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            sort: ['-rank'],
          });
      expect(result).toBeDefined();
      const original = result.map(x => x.rank);
      const sorted = [...original]
          .sort((a, b) => a > b ? -1 : (a < b ? 1 : 0));
      expect(original).toEqual(sorted);
    });


    it('Should limit retuning items', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            limit: 2,
          });
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
    });

    it('Should skip items', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            skip: 5,
            sort: ['_id']
          });
      expect(result).toBeDefined();
      expect(result[0]._id).toBeGreaterThan(5);
    });

    it('Should count total matches', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany(1, {
            filter: {rank: {$gt: 5}},
            count: true
          });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(ctx.response.totalMatches).toBeGreaterThan(5);
    });

  });


  describe('create()', function () {

    it('Should insert object into array field', async () => {
      const ctx = await app.createContext();
      const doc = {_id: 100, title: faker.lorem.text()};
      const result: any = await service.forContext(ctx)
          .create(1, doc);
      expect(result).toBeDefined();
      const r = await service.forContext(ctx).findById(1, 100);
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      const ctx = await app.createContext();
      const doc = {_id: 101, title: faker.lorem.text()};
      await expect(() => service.forContext(ctx).create(9999, doc))
          .rejects
          .toThrow('NOT_FOUND')
    });

  });


  describe('updateOnly()', function () {

    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = {title: faker.lorem.text()};
      const srcDoc = tempRecords[5];
      const result = await service.forContext(ctx)
          .updateOnly(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(result).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = await app.createContext();
      const doc = {title: faker.lorem.text()};
      const result = await service.forContext(ctx).updateOnly(9999, 1, doc);
      expect(result).toEqual(0);
    });

  });

  describe('update()', function () {

    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = {title: faker.lorem.text()};
      const srcDoc = tempRecords[5];
      const result: any = await service.forContext(ctx)
          .update(srcDoc._id, srcDoc.notes[0]._id, doc);
      expect(result).toBeDefined();
      const r = await service.forContext(ctx)
          .findById(srcDoc._id, srcDoc.notes[0]._id);
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      const ctx = await app.createContext();
      const doc = {title: faker.lorem.text()};
      const r = await service.forContext(ctx).update(9999, 1, doc);
      expect(r).not.toBeDefined();
    });

  });

  describe('updateMany()', function () {

    it('Should update all objects in the array field', async () => {
      const ctx = await app.createContext();
      const update = {title: faker.lorem.text()};
      const r = await service.forContext(ctx)
          .updateMany(tempRecords[3]._id, update);
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toEqual(
          expect.arrayContaining(
              [expect.objectContaining({
                title: update.title
              })]
          )
      );
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const update = {title: faker.lorem.text()};
      let r: any = await service.forContext(ctx)
          .updateMany(tempRecords[3]._id, update, {filter: 'rank>5'});
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toBeDefined();
      for (r of result!) {
        if (r.rank <= 5)
          expect(r.title).not.toEqual(update.title);
        else
          expect(r.title).toEqual(update.title);
      }
    });

  });


  describe('updateManyReturnCount()', function () {

    it('Should update all objects in the array field', async () => {
      const ctx = await app.createContext();
      const update = {title: faker.lorem.text()};
      const r: any = await service.forContext(ctx)
          .updateManyReturnCount(tempRecords[3]._id, update);
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toBeDefined();
      expect(result?.length).toEqual(r);
      expect(result).toEqual(
          expect.arrayContaining(
              [expect.objectContaining({
                title: update.title
              })]
          )
      );
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const update = {title: faker.lorem.text()};
      let r: any = await service.forContext(ctx)
          .updateManyReturnCount(tempRecords[3]._id, update, {filter: 'rank>5'});
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toBeDefined();
      for (r of result!) {
        if (r.rank <= 5)
          expect(r.title).not.toEqual(update.title);
        else
          expect(r.title).toEqual(update.title);
      }
    });

  });


  describe('delete()', function () {

    it('Should delete object from the array field', async () => {
      const ctx = await app.createContext();
      const doc = tempRecords[0];
      let r = await service.forContext(ctx)
          .findById(doc._id, doc.notes[0]._id);
      expect(r).toBeDefined();

      const result: any = await service.forContext(ctx)
          .delete(doc._id, doc.notes[0]._id);
      expect(result).toEqual(1);

      r = await service.forContext(ctx)
          .findById(doc._id, doc.notes[0]._id);
      expect(r).not.toBeDefined();
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = await app.createContext();
      const r = await service.forContext(ctx).delete(9999, 1);
      expect(r).toEqual(0);
    });

  });


  describe('deleteMany()', function () {

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .deleteMany(tempRecords[1]._id, {filter: {rank: {$gt: 5}}});
      expect(result).toBeGreaterThan(0);
      const r = await service.forContext(ctx)
          .count(tempRecords[1]._id);
      expect(r).toBeGreaterThan(0);
    });

    it('Should delete all object from the array field', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .deleteMany(tempRecords[0]._id);
      expect(result).toBeGreaterThan(0);
      const r = await service.forContext(ctx)
          .count(tempRecords[0]._id);
      expect(r).toEqual(0);
    });

  });


});

