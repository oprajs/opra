import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.transformSort', function () {
  afterAll(() => global.gc && global.gc());

  it('Should convert sort fields', async () => {
    const o: any = ElasticAdapter.prepareSort(['_id', 'givenName']);
    expect(o).toEqual(['_id', 'givenName']);
  });

  it('Should parse (+) ascending, (-) descending symbols', async () => {
    const o: any = ElasticAdapter.prepareSort(['+_id', '-givenName']);
    expect(o).toEqual(['_id', { givenName: 'desc' }]);
  });

  it('Should return undefined if array is empty', async () => {
    const o: any = ElasticAdapter.prepareSort([]);
    expect(o).toStrictEqual(undefined);
  });
});
