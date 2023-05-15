import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.transformSort', function () {

  it('Should convert sort fields', async () => {
    const o: any = ElasticAdapter.transformSort(['_id', 'givenName']);
    expect(o).toEqual(['_id', 'givenName']);
  });

  it('Should parse (+) ascending, (-) descending symbols', async () => {
    const o: any = ElasticAdapter.transformSort(['+_id', '-givenName']);
    expect(o).toEqual(['_id', {givenName: 'desc'}]);
  });

  it('Should return undefined if array is empty', async () => {
    const o: any = ElasticAdapter.transformSort([]);
    expect(o).toStrictEqual(undefined);
  });

});
