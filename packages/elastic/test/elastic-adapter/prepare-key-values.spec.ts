import { ElasticAdapter } from '@opra/elastic';

describe('MongoAdapter.prepareKeyValues', function () {
  afterAll(() => global.gc && global.gc());

  it('Should prepare single key', async () => {
    const out = ElasticAdapter.prepareKeyValues(1);
    expect(out).toStrictEqual({ _id: 1 });
  });

  it('Should prepare multiple key', async () => {
    const out = ElasticAdapter.prepareKeyValues({ userId: 1, active: true }, ['userId', 'active']);
    expect(out).toStrictEqual({ userId: 1, active: true });
  });
});
