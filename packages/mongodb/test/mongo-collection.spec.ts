import { Collection } from '@opra/common';
import { MongoCollection } from '@opra/mongodb';

describe('MongoCollection', function () {

  afterAll(() => global.gc && global.gc());

  it('Should set options', () => {
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

  it('Should reduce operations', () => {
    @Collection('any')
    class TestResource extends MongoCollection<any> {

      delete = undefined;
      deleteMany = undefined;
      findMany = undefined;
      get = undefined;
      updateMany = undefined;

      protected getService() {
        return {} as any;
      }
    }

    const r = new TestResource();
    expect(r.create).toBeInstanceOf(Function);
    expect(r.update).toBeInstanceOf(Function);
    expect(r.delete).toStrictEqual(undefined);
    expect(r.deleteMany).toStrictEqual(undefined);
    expect(r.findMany).toStrictEqual(undefined);
    expect(r.get).toStrictEqual(undefined);
    expect(r.updateMany).toStrictEqual(undefined);
  })

});

