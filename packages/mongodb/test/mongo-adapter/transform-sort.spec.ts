import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.transformSort', function () {

  it('Should convert sort fields', async () => {
    const o: any = MongoAdapter.transformSort(['_id', 'givenName']);
    expect(o).toEqual({
      _id: 1,
      givenName: 1
    });
  });

  it('Should parse (+) ascending, (-) descending symbols', async () => {
    const o: any = MongoAdapter.transformSort(['+_id', '-givenName']);
    expect(o).toEqual({
      _id: 1,
      givenName: -1
    });
  });

  it('Should return undefined if array is empty', async () => {
    const o: any = MongoAdapter.transformSort([]);
    expect(o).toStrictEqual(undefined);
  });

});

