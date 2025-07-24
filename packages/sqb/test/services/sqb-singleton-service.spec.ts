import { faker } from '@faker-js/faker';
import { ResourceNotAvailableError } from '@opra/common';
import { SqbSingletonService } from '@opra/sqb';
import { TempCustomer } from 'customer-sqb';
import { expect } from 'expect';
import { CustomerApplication } from 'express-sqb';
import * as sinon from 'sinon';
import { createContext } from '../_support/create-context.js';

describe('sqb:SqbSingletonService', () => {
  let app: CustomerApplication;
  let service: SqbSingletonService<any>;
  let tempRecord: any;
  const interceptorFn = fn => fn();

  before(async () => {
    app = await CustomerApplication.create();
    service = new SqbSingletonService<any>(TempCustomer, {
      db: app.db,
      id: 1,
    });
    const customerRepository = app.db.getRepository(TempCustomer);
    await customerRepository.deleteMany();
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
    await customerRepository.create(tempRecord);
  });

  after(() => app?.close());
  afterEach(() => sinon.restore());

  beforeEach(() => (service.id = 1));

  describe('sqb:assert()', () => {
    it('Should not throw if document exists', async () => {
      const ctx = createContext(app.adapter);
      await service.for(ctx).assert();
    });

    it('Should throw error if not found', async () => {
      const ctx = createContext(app.adapter);
      service.id = 99;
      await expect(() => service.for(ctx).assert()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by commonFilter', async () => {
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { commonFilter: 'rate=99' }).assert(),
      ).rejects.toThrow(ResourceNotAvailableError);
    });
  });

  describe('sqb:findOne()', () => {
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
      const result: any = await service
        .for(ctx)
        .find({ filter: { _id: 9999 } });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter', async () => {
      const ctx = createContext(app.adapter);
      const result: any = await service.for(ctx).find({
        filter: 'rate>5',
      });
      expect(result).not.toBeDefined();
    });

    it('Should apply filter returned by commonFilter', async () => {
      sinon.stub(service as any, '_getCommonFilter').resolves('_id=2');
      const ctx = createContext(app.adapter);
      const result: any = await service
        .for(ctx, { commonFilter: '_id=2' })
        .find();
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
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.find();
      expect(result).toBeDefined();
      expect(mockFn.callCount).toEqual(1);
    });
  });

  describe('sqb:get()', () => {
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
      service.id = 99;
      const ctx = createContext(app.adapter);
      await expect(() => service.for(ctx).get()).rejects.toThrow(
        ResourceNotAvailableError,
      );
    });

    it('Should apply filter returned by commonFilter', async () => {
      sinon.stub(service as any, '_getCommonFilter').resolves('rate=999');
      const ctx = createContext(app.adapter);
      await expect(() =>
        service.for(ctx, { commonFilter: 'rate=99' }).get(),
      ).rejects.toThrow(ResourceNotAvailableError);
    });

    it('Should run interceptors', async () => {
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.get();
      expect(result).toBeDefined();
      expect(mockFn.callCount).toEqual(1);
    });
  });

  describe('sqb:create()', () => {
    it('Should insert document', async () => {
      service.id = 2;
      const ctx = createContext(app.adapter);
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service.for(ctx).create(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).get();
      expect(result).toEqual(r);
    });

    it('Should run interceptors', async () => {
      service.id = 3;
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { _id: 100, uid: faker.string.uuid() };
      const result: any = await service
        .for(ctx, { interceptor: mockFn })
        .create(doc);
      expect(result).toBeDefined();
      expect(mockFn.callCount).toEqual(1);
    });
  });

  describe('sqb:updateOnly()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).updateOnly(doc);
      expect(r).toEqual(1);
    });

    it('Should return "0" if parent record not found', async () => {
      service.id = 99;
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).updateOnly(doc);
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by commonFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service
        .for(ctx, { commonFilter: 'rate=99' })
        .updateOnly(doc);
      expect(r).toEqual(0);
    });

    it('Should run interceptors', async () => {
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const newService = service.for(ctx, { interceptor: mockFn });
      const result = await newService.updateOnly(doc);
      expect(result).toBeDefined();
      expect(mockFn.callCount).toEqual(1);
    });
  });

  describe('sqb:update()', () => {
    it('Should update object in the array field', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result: any = await service.for(ctx).update(doc);
      expect(result).toBeDefined();
      const r = await service.for(ctx).find();
      expect(result).toEqual(r);
    });

    it('Should return "undefined" if parent record not found', async () => {
      service.id = 99;
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const r = await service.for(ctx).update(doc);
      expect(r).not.toBeDefined();
    });

    it('Should apply filter returned by commonFilter', async () => {
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const result = await service
        .for(ctx, { commonFilter: 'rate=999' })
        .update(doc);
      expect(result).not.toBeDefined();
    });

    it('Should run interceptors', async () => {
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const doc = { uid: faker.string.uuid() };
      const newService = service.for(ctx, { interceptor: mockFn });
      const result: any = await newService.update(doc);
      expect(result).toBeDefined();
      expect(mockFn.callCount).toEqual(1);
    });
  });

  describe('sqb:delete()', () => {
    it('Should return "0" if parent record not found', async () => {
      service.id = 99;
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx).delete();
      expect(r).toEqual(0);
    });

    it('Should apply filter returned by commonFilter', async () => {
      const ctx = createContext(app.adapter);
      const r = await service.for(ctx, { commonFilter: 'rate=999' }).delete();
      expect(r).toEqual(0);
    });

    it('Should delete document', async () => {
      const ctx = createContext(app.adapter);
      let x = await service.for(ctx).find();
      expect(x).toBeDefined();

      const r = await service.for(ctx).delete();
      expect(r).toEqual(1);

      x = await service.for(ctx).find();
      expect(x).not.toBeDefined();
    });

    it('Should run interceptors', async () => {
      const mockFn = sinon.spy(interceptorFn);
      const ctx = createContext(app.adapter);
      const newService = service.for(ctx, { interceptor: mockFn });
      await newService.delete();
      expect(mockFn.callCount).toEqual(1);
    });
  });
});
