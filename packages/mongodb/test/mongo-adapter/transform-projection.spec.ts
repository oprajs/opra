import { ApiDocument } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../../../sqb/test/_support/test-app/index.js';

describe('MongoAdapter.transformProjection', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createTestApp()).api;
  });

  it('Should process "pick" only args', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1
    });
  });

  it('Should process "pick" only args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "pick" and "include" args', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName'],
          include: ['gender', 'address']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
      gender: 1,
      address: 1
    });
  });

  it('Should process "pick" and "include" args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          pick: ['_id', 'givenName'],
          include: ['gender', 'address.city']
        }
    );
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
      gender: 1,
      address: {
        city: 1
      }
    });
  });

  it('Should process "pick" and "omit" args', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "pick" and "omit" args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "include" only args', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          include: ['address']
        }
    );
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(1);
    expect(o.givenName).toStrictEqual(1);
    expect(o.address).toStrictEqual(1);
  });

  it('Should process "include" only args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "include" and "omit args', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "include" and "omit args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
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

  it('Should process "omit" only args', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          omit: ['_id', 'givenName']
        }
    );
    expect(o).toEqual({
      _id: 0,
      givenName: 0
    })
    expect(o).toBeDefined();
    expect(o._id).toStrictEqual(0);
    expect(o.givenName).toStrictEqual(0);
    expect(o.gender).not.toBeDefined();
    expect(o.address).not.toBeDefined();
  });

  it('Should process "omit" only args: nested fields', async () => {
    const o: any = MongoAdapter.transformProjection(
        api.getComplexType('customer'), {
          omit: ['_id', 'address.city']
        }
    );
    expect(o).toEqual({
      _id: 0,
      address: {
        city: 0
      }
    })
  });

});

