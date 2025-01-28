import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.prepareFilter', () => {
  afterAll(() => global.gc && global.gc());

  describe('Convert Ast to elastic filter', () => {
    it('Should convert ComparisonExpression (=)', async () => {
      let out = ElasticAdapter.prepareFilter('givenName="Demons"');
      expect(out).toStrictEqual({ match: { givenName: 'Demons' } });
      out = ElasticAdapter.prepareFilter('rate=10');
      expect(out).toStrictEqual({ match: { rate: 10 } });
      out = ElasticAdapter.prepareFilter('active=false');
      expect(out).toStrictEqual({ match: { active: false } });
      out = ElasticAdapter.prepareFilter('deleted=null');
      expect(out).toStrictEqual({
        bool: { must_not: { exists: { field: 'deleted' } } },
      });
    });

    it('Should convert ComparisonExpression (not =)', async () => {
      let out = ElasticAdapter.prepareFilter('not rate=10');
      expect(out).toStrictEqual({
        bool: { must_not: { match: { rate: 10 } } },
      });
      out = ElasticAdapter.prepareFilter('not active=false');
      expect(out).toStrictEqual({
        bool: { must_not: { match: { active: false } } },
      });
      out = ElasticAdapter.prepareFilter('not deleted=null');
      expect(out).toStrictEqual({ exists: { field: 'deleted' } });
    });

    it('Should convert ComparisonExpression (!=)', async () => {
      let out = ElasticAdapter.prepareFilter('rate!=10');
      expect(out).toStrictEqual({
        bool: { must_not: { match: { rate: 10 } } },
      });
      out = ElasticAdapter.prepareFilter('active!=false');
      expect(out).toStrictEqual({
        bool: { must_not: { match: { active: false } } },
      });
      out = ElasticAdapter.prepareFilter('deleted!=null');
      expect(out).toStrictEqual({ exists: { field: 'deleted' } });
    });

    it('Should convert ComparisonExpression (not !=)', async () => {
      let out = ElasticAdapter.prepareFilter('not rate!=10');
      expect(out).toStrictEqual({ match: { rate: 10 } });
      out = ElasticAdapter.prepareFilter('not active!=false');
      expect(out).toStrictEqual({ match: { active: false } });
      out = ElasticAdapter.prepareFilter('not deleted!=null');
      expect(out).toStrictEqual({
        bool: { must_not: { exists: { field: 'deleted' } } },
      });
    });

    it('Should convert ComparisonExpression (>)', async () => {
      const out = ElasticAdapter.prepareFilter('rate>5');
      expect(out).toStrictEqual({ range: { rate: { gt: 5 } } });
    });

    it('Should convert ComparisonExpression (not >)', async () => {
      const out = ElasticAdapter.prepareFilter('not rate>5');
      expect(out).toStrictEqual({
        bool: { must_not: { range: { rate: { gt: 5 } } } },
      });
    });

    it('Should convert ComparisonExpression (>=)', async () => {
      const out = ElasticAdapter.prepareFilter('rate>=5');
      expect(out).toStrictEqual({ range: { rate: { gte: 5 } } });
    });

    it('Should convert ComparisonExpression (not >=)', async () => {
      const out = ElasticAdapter.prepareFilter('not rate>=5');
      expect(out).toStrictEqual({
        bool: { must_not: { range: { rate: { gte: 5 } } } },
      });
    });

    it('Should convert ComparisonExpression (<)', async () => {
      const out = ElasticAdapter.prepareFilter('rate<5');
      expect(out).toStrictEqual({ range: { rate: { lt: 5 } } });
    });

    it('Should convert ComparisonExpression (not <)', async () => {
      const out = ElasticAdapter.prepareFilter('not rate<5');
      expect(out).toStrictEqual({
        bool: { must_not: { range: { rate: { lt: 5 } } } },
      });
    });

    it('Should convert ComparisonExpression (<=)', async () => {
      const out = ElasticAdapter.prepareFilter('rate<=5');
      expect(out).toStrictEqual({ range: { rate: { lte: 5 } } });
    });

    it('Should convert ComparisonExpression (not <=)', async () => {
      const out = ElasticAdapter.prepareFilter('not rate<=5');
      expect(out).toStrictEqual({
        bool: { must_not: { range: { rate: { lte: 5 } } } },
      });
    });

    it('Should convert ComparisonExpression (in)', async () => {
      let out = ElasticAdapter.prepareFilter('rate in [5,6]');
      expect(out).toStrictEqual({ terms: { rate: [5, 6] } });
      out = ElasticAdapter.prepareFilter('rate in 5');
      expect(out).toStrictEqual({ match: { rate: 5 } });
    });

    it('Should convert ComparisonExpression (not in)', async () => {
      let out = ElasticAdapter.prepareFilter('not rate in [5,6]');
      expect(out).toStrictEqual({
        bool: { must_not: { terms: { rate: [5, 6] } } },
      });
      out = ElasticAdapter.prepareFilter('not rate in 5');
      expect(out).toStrictEqual({ bool: { must_not: { match: { rate: 5 } } } });
    });

    it('Should convert ComparisonExpression (!in)', async () => {
      let out = ElasticAdapter.prepareFilter('rate !in [5,6]');
      expect(out).toStrictEqual({
        bool: { must_not: { terms: { rate: [5, 6] } } },
      });
      out = ElasticAdapter.prepareFilter('rate !in 5');
      expect(out).toStrictEqual({ bool: { must_not: { match: { rate: 5 } } } });
    });

    it('Should convert ComparisonExpression (not !in)', async () => {
      let out = ElasticAdapter.prepareFilter('not rate !in [5,6]');
      expect(out).toStrictEqual({ terms: { rate: [5, 6] } });
      out = ElasticAdapter.prepareFilter('not rate !in 5');
      expect(out).toStrictEqual({ match: { rate: 5 } });
    });

    it('Should convert ComparisonExpression (like)', async () => {
      const out = ElasticAdapter.prepareFilter('givenName like "Demons%"');
      expect(out).toStrictEqual({
        wildcard: { givenName: { value: 'Demons*' } },
      });
    });

    it('Should convert ComparisonExpression (not like)', async () => {
      const out = ElasticAdapter.prepareFilter('not givenName like "Demons%"');
      expect(out).toStrictEqual({
        bool: { must_not: { wildcard: { givenName: { value: 'Demons*' } } } },
      });
    });

    it('Should convert ComparisonExpression (!like)', async () => {
      const out = ElasticAdapter.prepareFilter('givenName !like "Demons%"');
      expect(out).toStrictEqual({
        bool: { must_not: { wildcard: { givenName: { value: 'Demons*' } } } },
      });
    });

    it('Should convert ComparisonExpression (not !like)', async () => {
      const out = ElasticAdapter.prepareFilter('not givenName !like "Demons%"');
      expect(out).toStrictEqual({
        wildcard: { givenName: { value: 'Demons*' } },
      });
    });

    it('Should convert ComparisonExpression (ilike)', async () => {
      const out = ElasticAdapter.prepareFilter('givenName ilike "Demons%"');
      expect(out).toStrictEqual({
        wildcard: { givenName: { value: 'Demons*', case_insensitive: true } },
      });
    });

    it('Should convert ComparisonExpression (not ilike)', async () => {
      const out = ElasticAdapter.prepareFilter('not givenName ilike "Demons%"');
      expect(out).toStrictEqual({
        bool: {
          must_not: {
            wildcard: {
              givenName: {
                value: 'Demons*',
                case_insensitive: true,
              },
            },
          },
        },
      });
    });

    it('Should convert ComparisonExpression (!ilike)', async () => {
      const out = ElasticAdapter.prepareFilter('givenName !ilike "Demons%"');
      expect(out).toStrictEqual({
        bool: {
          must_not: {
            wildcard: {
              givenName: {
                value: 'Demons*',
                case_insensitive: true,
              },
            },
          },
        },
      });
    });

    it('Should convert ComparisonExpression (not !ilike)', async () => {
      const out = ElasticAdapter.prepareFilter(
        'not givenName !ilike "Demons%"',
      );
      expect(out).toStrictEqual({
        wildcard: { givenName: { value: 'Demons*', case_insensitive: true } },
      });
    });

    it('Should convert LogicalExpression (and)', async () => {
      const out = ElasticAdapter.prepareFilter('rate=1 and rate=2');
      expect(out).toStrictEqual({
        bool: {
          must: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });

    it('Should convert LogicalExpression (not and)', async () => {
      const out = ElasticAdapter.prepareFilter('not (rate=1 and rate=2)');
      expect(out).toStrictEqual({
        bool: {
          must_not: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });

    it('Should convert LogicalExpression (or)', async () => {
      const out = ElasticAdapter.prepareFilter('rate=1 or rate=2');
      expect(out).toStrictEqual({
        bool: {
          should: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });

    it('Should convert LogicalExpression (not or)', async () => {
      const out = ElasticAdapter.prepareFilter('not (rate=1 or rate=2)');
      expect(out).toStrictEqual({
        bool: {
          should_not: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });
  });

  describe('Merge multiple filters', () => {
    it('Should merge fields', async () => {
      const out = ElasticAdapter.prepareFilter(['rate=1', 'rate=2']);
      expect(out).toStrictEqual({
        bool: {
          must: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });

    it('Should merge fields', async () => {
      const out = ElasticAdapter.prepareFilter([
        'rate=1',
        { match: { rate: 2 } },
      ]);
      expect(out).toStrictEqual({
        bool: {
          must: [{ match: { rate: 1 } }, { match: { rate: 2 } }],
        },
      });
    });
  });
});
