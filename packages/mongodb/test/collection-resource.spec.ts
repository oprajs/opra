import { Collection } from '@opra/common';
import { MongoCollectionResource } from '@opra/mongodb';

describe('MongoCollectionResource', function () {

  it('Should set options on create', () => {
    @Collection('any')
    class TestResource extends MongoCollectionResource<any> {
      constructor() {
        super({defaultLimit: 50});
      }

      getService() {
        return null as any;
      }
    }

    const r = new TestResource();
    expect(r.defaultLimit).toStrictEqual(50);
  })

  it('Should set operations to be activated', () => {
    @Collection('any')
    class TestResource extends MongoCollectionResource<any> {
      constructor() {
        super({operations: ['get', 'updateMany']});
      }

      getService() {
        return null as any;
      }
    }

    const r = new TestResource();
    expect(r.get).toBeInstanceOf(Function);
    expect(r.updateMany).toBeInstanceOf(Function);
    expect(r.update).toStrictEqual(null);
  })

});

