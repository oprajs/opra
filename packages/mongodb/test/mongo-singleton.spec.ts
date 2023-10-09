import { Collection } from '@opra/common';
import { MongoSingleton } from '@opra/mongodb';

describe('MongoSingleton', function () {

  afterAll(() => global.gc && global.gc());

  it('Should reduce operations', () => {
    @Collection('any')
    class TestResource extends MongoSingleton<any> {

      delete = undefined;
      get = undefined;

      protected getService() {
        return {} as any;
      }
    }

    const r = new TestResource();
    expect(r.create).toBeInstanceOf(Function);
    expect(r.update).toBeInstanceOf(Function);
    expect(r.delete).toStrictEqual(undefined);
    expect(r.get).toStrictEqual(undefined);
  })

});

