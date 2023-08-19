import { Collection } from '@opra/common';
import { MongoCollection } from '@opra/mongodb';

describe('MongoCollectionResource', function () {

  it('Should set options on create', () => {
    @Collection('any')
    class TestResource extends MongoCollection<any> {
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

  it('Should disable operations', () => {
    @Collection('any')
    class TestResource extends MongoCollection<any> {
      update = undefined;

      getService() {
        return null as any;
      }
    }

    const r = new TestResource();
    expect(r.get).toBeInstanceOf(Function);
    expect(r.updateMany).toBeInstanceOf(Function);
    expect(r.update).toStrictEqual(undefined);
  })

});

