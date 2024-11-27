import { ApiDocument } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { CustomerApplication } from 'express-mongo';

describe('MongoAdapter.prepareProjection', () => {
  let document: ApiDocument;

  beforeAll(async () => {
    document = (await CustomerApplication.create()).document;
  });

  afterAll(() => global.gc && global.gc());

  it('Should process "pick"', async () => {
    const o: any = MongoAdapter.prepareProjection(document.node.getComplexType('customer'), [
      '_id',
      'givenname',
      'address.city',
    ]);
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
      address: {
        city: 1,
      },
    });
  });

  it('Should ignore exclusive fields by default', async () => {
    const o: any = MongoAdapter.prepareProjection(document.node.getComplexType('note'));
    expect(o).toEqual({
      _id: 1,
      createdAt: 1,
      deleted: 1,
      rank: 1,
      text: 1,
      title: 1,
      updatedAt: 1,
    });
  });

  it('Should include exclusive fields using projection', async () => {
    const o: any = MongoAdapter.prepareProjection(document.node.getComplexType('note'), ['+largecontent']);
    expect(o).toEqual({
      _id: 1,
      createdAt: 1,
      deleted: 1,
      rank: 1,
      text: 1,
      title: 1,
      largeContent: 1,
      updatedAt: 1,
    });
  });

  it('Should omit fields using projection', async () => {
    const o: any = MongoAdapter.prepareProjection(document.node.getComplexType('note'), ['-title']);
    expect(o).toEqual({
      _id: 1,
      createdAt: 1,
      deleted: 1,
      rank: 1,
      text: 1,
      updatedAt: 1,
    });
  });
});
