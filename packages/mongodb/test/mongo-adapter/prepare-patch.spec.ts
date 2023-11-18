import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.preparePatch', function () {

  afterAll(() => global.gc && global.gc());

  it('Should convert simple values', async () => {
    const o: any = MongoAdapter.preparePatch({_id: 123});
    expect(o).toEqual({
      $set: {
        _id: 123
      }
    });
  });

  it('Should patch nested fields', async () => {
    const o: any = MongoAdapter.preparePatch({_id: 123, address: {city: 'Berlin'}});
    expect(o).toEqual({
      $set: {
        '_id': 123,
        'address.city': 'Berlin'
      }
    });
  });

  it('Should replace nested fields if starts with *', async () => {
    const o: any = MongoAdapter.preparePatch({_id: 123, '*address': {city: 'Berlin'}});
    expect(o).toEqual({
      $set: {
        '_id': 123,
        'address': {city: 'Berlin'}
      }
    });
  });

  it('Should unset fields', async () => {
    const o: any = MongoAdapter.preparePatch({_id: 123, gender: null, address: {city: null}});
    expect(o).toEqual({
      $set: {
        '_id': 123
      },
      $unset: {
        'gender': '',
        'address.city': ''
      }
    });
  });


});

