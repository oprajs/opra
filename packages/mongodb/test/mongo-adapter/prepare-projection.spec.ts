import { ApiDocument } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { TestApp } from '../_support/test-app/index.js';

describe('MongoAdapter.prepareProjection', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await TestApp.create()).api;
  });

  afterAll(() => global.gc && global.gc());

  it('Should process "pick"', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1
    });
  });

  it('Should process "pick" nested', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'address.city']
        }
    );
    expect(o).toEqual({
      _id: 1,
      address: {
        city: 1
      }
    });
  });

  it('Should ignore "include" if "pick" defined', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName'],
          include: ['gender', 'address']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
    });
  });

  it('Should ignore "include" if "pick" defined - nested', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName'],
          include: ['gender', 'address.city']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1
    });
  });

  it('Should ignore field if omitted event in "pick" list', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName', 'gender'],
          omit: ['givenName']
        }
    );
    expect(o).toEqual({
      _id: 1,
      gender: 1
    });
  });

  it('Should ignore field if omitted event in "pick" list nested', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName', 'address'],
          omit: ['address.zipCode', 'address.street']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
      address: {
        city: 1,
        countryCode: 1
      }
    });
  });

  it('Should process "include"', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          include: ['address']
        }
    );
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(1);
    expect(o.givenName).toStrictEqual(1);
    expect(o.address).toStrictEqual(1);
  });

  it('Should process "include" nested', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          include: ['address.city']
        }
    );
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(1);
    expect(o.givenName).toStrictEqual(1);
    expect(o.address).toEqual({
      countryCode: 1,
      street: 1,
      zipCode: 1,
      city: 1
    });
  });

  it('Should process "include" and "omit"', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          include: ['address'],
          omit: ['givenName'],
        }
    );
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(1);
    expect(o.givenName).not.toBeDefined();
    expect(o.address).toStrictEqual(1);
  });

  it('Should process "include" and "omit" nested', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          include: ['address'],
          omit: ['givenName', 'address.city'],
        }
    );
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(1);
    expect(o.givenName).not.toBeDefined();
    expect(typeof o.address).toStrictEqual('object');
    expect(o.address.street).toStrictEqual(1);
    expect(o.address.city).not.toBeDefined();
  });

  it('Should process "omit"', async () => {
    const o: any = MongoAdapter.prepareProjection(
        api.getComplexType('customer'), {
          omit: ['_id', 'givenName']
        }
    );
    expect(o).toEqual({
      active: 1,
      birthDate: 1,
      countryCode: 1,
      createdAt: 1,
      deleted: 1,
      familyName: 1,
      fillerDate: 1,
      gender: 1,
      rate: 1,
      uid: 1,
      updatedAt: 1
    })
  });
  
});

