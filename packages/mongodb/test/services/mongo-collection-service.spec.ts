import { faker } from '@faker-js/faker';
import { MongoCollectionService } from '@opra/mongodb';
import { TestApp } from '../_support/test-app/index.js';

describe('MongoCollectionService', function () {
  let app: TestApp;
  let service: MongoCollectionService<any>;
  const tempRecords: any[] = [];

  beforeAll(async () => {
    app = await TestApp.create();
    service = new MongoCollectionService<any>('Customer', {
      db: app.db,
      collectionName: 'MongoCollectionService'
    });

    for (let i = 1; i <= 10; i++) {
      const record: any = {
        _id: i,
        uid: faker.string.uuid(),
        active: faker.datatype.boolean(),
        countryCode: faker.location.countryCode(),
        rate: i,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        address: {
          city: faker.location.city()
        }
      }
      tempRecords.push(record);
    }
    const collection = app.db.collection('MongoCollectionService');
    await collection.deleteMany();
    await collection.insertMany(tempRecords);
  });

  afterAll(async () => {
    await app?.close();
  })

  afterAll(() => global.gc && global.gc());


  describe('assert()', function () {

    it('Should not throw if document exists', async () => {
      const ctx = await app.createContext();
      await service.forContext(ctx).assert(1);
    });

    it('Should throw error if not found', async () => {
      const ctx = await app.createContext();
      await expect(() => service.forContext(ctx).assert(9999)).rejects
          .toThrow('NOT_FOUND')
    });

  });


  describe('findById()', function () {

    it('Should return single object', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findById(1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should return undefined if not found', async () => {
      const ctx = await app.createContext();
      const r = await service.forContext(ctx).findById(9999);
      expect(r).not.toBeDefined();
    });

  });

  describe('count()', function () {

    it('Should count number of elements in array field', async () => {
      const ctx = await app.createContext();
      const result = await service.forContext(ctx)
          .count();
      expect(result).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result1 = await service.forContext(ctx)
          .count();
      const result2 = await service.forContext(ctx)
          .count({filter: {rate: {$gt: 5}}});
      expect(result1).toBeGreaterThan(result2);
    });

  });


  describe('findOne()', function () {

    it('Should return single document', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne();
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should return "undefined" if not found', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne({filter: {_id: 9999}});
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne({
            filter: {rate: {$gt: 5}}
          });
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: expect.any(Number),
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(5);
    });

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne({
            include: ['address']
          });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should pick fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne({
            pick: ['rate']
          });
      expect(result).toBeDefined();
      expect(result.givenName).not.toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).toBeGreaterThan(0);
    });

    it('Should omit fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findOne({
            omit: ['rate']
          });
      expect(result).toBeDefined();
      expect(result.givenName).toBeDefined();
      expect(result.address).not.toBeDefined();
      expect(result.rate).not.toBeDefined();
    });

    it('Should return sorted', async () => {
      const ctx = await app.createContext();
      const result1: any = await service.forContext(ctx)
          .findOne({sort: ['_id']});
      const result2: any = await service.forContext(ctx)
          .findOne({sort: ['-_id']});
      expect(result1._id).toBeLessThan(result2._id);
    });

    it('Should skip records', async () => {
      const ctx = await app.createContext();
      const result1: any = await service.forContext(ctx)
          .findOne({skip: 1, sort: ['_id']});
      const result2: any = await service.forContext(ctx)
          .findOne({skip: 2, sort: ['_id']});
      expect(result1._id).toBeLessThan(result2._id);
    });

  });


  describe('findMany()', function () {

    it('Should return documents', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany();
      expect(result).toBeDefined();
      expect(result).toEqual(
          expect.arrayContaining(
              [expect.objectContaining({
                _id: expect.any(Number),
                rate: expect.any(Number),
              })]
          )
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            filter: {rate: {$gt: 5}}
          });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const r of result)
        expect(r.rate).toBeGreaterThan(5);
    });

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            include: ['address']
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
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            pick: ['rate']
          });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).not.toBeDefined();
        expect(r.address).not.toBeDefined();
        expect(r.rate).toBeGreaterThan(0);
      }
    });

    it('Should omit fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            omit: ['rate']
          });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).toBeDefined();
        expect(r.address).not.toBeDefined();
        expect(r.rate).not.toBeDefined();
      }
    });

    it('Should include exclusive fields', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            include: ['address']
          });
      for (const r of result) {
        expect(r).toBeDefined();
        expect(r.givenName).toBeDefined();
        expect(r.address).toBeDefined();
        expect(r.rate).toBeGreaterThan(0);
      }

    });

    it('Should sort items', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            sort: ['-rate'],
          });
      expect(result).toBeDefined();
      const original = result.map(x => x.rate);
      const sorted = [...original]
          .sort((a, b) => a > b ? -1 : (a < b ? 1 : 0));
      expect(original).toEqual(sorted);
    });


    it('Should limit retuning items', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            limit: 2,
          });
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
    });

    it('Should skip items', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            skip: 5,
            sort: ['_id']
          });
      expect(result).toBeDefined();
      expect(result[0]._id).toBeGreaterThan(5);
    });

    it('Should count total matches', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .findMany({
            filter: {rate: {$gt: 5}},
            count: true
          });
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(ctx.response.totalMatches).toBeGreaterThan(5);
    });

  });


  describe('get()', function () {

    it('Should return single document', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .get(1);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        _id: 1,
        rate: expect.any(Number),
      });
      expect(result.address).not.toBeDefined();
    });

    it('Should throw error if not found', async () => {
      const ctx = await app.createContext();
      await expect(() => service.forContext(ctx).get(9999)).rejects
          .toThrow('NOT_FOUND')
    });

  });


  describe('create()', function () {

    it('Should insert object into array field', async () => {
      const ctx = await app.createContext();
      const doc = {_id: 100, uid: faker.string.uuid()};
      const result: any = await service.forContext(ctx)
          .create(doc);
      expect(result).toBeDefined();
      const r = await service.forContext(ctx).get(100);
      expect(result).toEqual(r);
    });

  });


  describe('updateOnly()', function () {

    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = {uid: faker.string.uuid()};
      const srcDoc = tempRecords[5];
      const result = await service.forContext(ctx)
          .updateOnly(srcDoc._id, doc);
      expect(result).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = await app.createContext();
      const doc = {uid: faker.string.uuid()};
      const result = await service.forContext(ctx).updateOnly(9999, doc);
      expect(result).toEqual(0);
    });

  });

  describe('update()', function () {

    it('Should update object in the array field', async () => {
      const ctx = await app.createContext();
      const doc = {uid: faker.string.uuid()};
      const srcDoc = tempRecords[5];
      const result: any = await service.forContext(ctx)
          .update(srcDoc._id, doc);
      expect(result).toBeDefined();
      const r = await service.forContext(ctx)
          .findById(srcDoc._id);
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      const ctx = await app.createContext();
      const doc = {uid: faker.string.uuid()};
      const r = await service.forContext(ctx).update(9999, doc);
      expect(r).not.toBeDefined();
    });

  });

  describe('updateMany()', function () {

    it('Should update all objects in the array field', async () => {
      const ctx = await app.createContext();
      const update = {uid: faker.string.uuid()};
      const r = await service.forContext(ctx)
          .updateMany(update);
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toEqual(
          expect.arrayContaining(
              [expect.objectContaining({
                uid: update.uid
              })]
          )
      );
    });

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const update = {uid: faker.string.uuid()};
      let r: any = await service.forContext(ctx)
          .updateMany(update, {filter: 'rate>5'});
      expect(r).toBeGreaterThan(0);
      const result = await service.forContext(ctx)
          .findMany(tempRecords[3]._id);
      expect(result).toBeDefined();
      for (r of result!) {
        if (r.rate <= 5)
          expect(r.uid).not.toEqual(update.uid);
        else
          expect(r.uid).toEqual(update.uid);
      }
    });

  });


  describe('delete()', function () {

    it('Should delete document', async () => {
      const ctx = await app.createContext();
      const doc = tempRecords[0];
      let r = await service.forContext(ctx)
          .findById(doc._id);
      expect(r).toBeDefined();

      const result: any = await service.forContext(ctx)
          .delete(doc._id);
      expect(result).toEqual(1);

      r = await service.forContext(ctx)
          .findById(doc._id);
      expect(r).not.toBeDefined();
    });

    it('Should return "0" if parent record not found', async () => {
      const ctx = await app.createContext();
      const r = await service.forContext(ctx).delete(9999);
      expect(r).toEqual(0);
    });

  });


  describe('deleteMany()', function () {

    it('Should apply filter', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .deleteMany({filter: {rate: {$gt: 5}}});
      expect(result).toBeGreaterThan(0);
      const r = await service.forContext(ctx)
          .count();
      expect(r).toBeGreaterThan(0);
    });

    it('Should delete all object from the array field', async () => {
      const ctx = await app.createContext();
      const result: any = await service.forContext(ctx)
          .deleteMany();
      expect(result).toBeGreaterThan(0);
      const r = await service.forContext(ctx)
          .count();
      expect(r).toEqual(0);
    });


  });


});

