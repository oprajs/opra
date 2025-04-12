import { MongoAdapter } from '@opra/mongodb';
import { expect } from 'expect';

describe('MongoAdapter.prepareSort', () => {
  it('Should convert sort fields', async () => {
    const o: any = MongoAdapter.prepareSort(['_id', 'givenName']);
    expect(o).toEqual({
      _id: 1,
      givenName: 1,
    });
  });

  it('Should parse (+) ascending, (-) descending symbols', async () => {
    const o: any = MongoAdapter.prepareSort(['+_id', '-givenName']);
    expect(o).toEqual({
      _id: 1,
      givenName: -1,
    });
  });

  it('Should return undefined if array is empty', async () => {
    const o: any = MongoAdapter.prepareSort([]);
    expect(o).toStrictEqual(undefined);
  });
});
