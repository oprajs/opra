import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.preparePatch', () => {
  afterAll(() => global.gc && global.gc());

  it('Should convert simple values', async () => {
    const o: any = ElasticAdapter.preparePatch({ age: 21 });
    expect(o).toEqual({
      source: `ctx._source['age'] = params['age'];`,
      params: { age: 21 },
      lang: 'painless',
    });
  });

  it('Should patch objects fields', async () => {
    const o: any = ElasticAdapter.preparePatch({
      age: 21,
      address: { city: 'Berlin' },
    });
    expect(o).toEqual({
      source: [
        `ctx._source['age'] = params['age'];`,
        `ctx._source['address.city'] = params['address.city'];`,
      ].join('\n'),
      params: {
        age: 21,
        'address.city': 'Berlin',
      },
      lang: 'painless',
    });
  });

  it('Should replace objects fields if starts with *', async () => {
    const o: any = ElasticAdapter.preparePatch({
      age: 21,
      '*address': { city: 'Berlin' },
    });
    expect(o).toEqual({
      source: [
        `ctx._source['age'] = params['age'];`,
        `ctx._source['address'] = params['address'];`,
      ].join('\n'),
      params: {
        age: 21,
        address: { city: 'Berlin' },
      },
      lang: 'painless',
    });
  });

  it('Should unset fields', async () => {
    const o: any = ElasticAdapter.preparePatch({
      gender: null,
      address: { city: null },
    });
    expect(o).toEqual({
      source: [
        `ctx._source.remove('gender');`,
        `ctx._source.remove('address.city');`,
      ].join('\n'),
      params: {},
      lang: 'painless',
    });
  });
});
