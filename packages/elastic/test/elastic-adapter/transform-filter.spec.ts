/* eslint-disable camelcase */
import { ApiDocument, Collection } from '@opra/common';
import { createTestApi } from '@opra/core/test/_support/test-app/index';
import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.transformFilter', function () {

  let api: ApiDocument;
  let customers: Collection;

  beforeAll(async () => {
    api = await createTestApi();
    customers = api.getCollection('customers');
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName="Demons"'));
    expect(out).toStrictEqual({
      query: {term: {givenName: 'Demons'}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate=10'));
    expect(out).toStrictEqual({
      query: {term: {rate: 10}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('active=true'));
    expect(out).toStrictEqual({
      query: {term: {active: true}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('active=false'));
    expect(out).toStrictEqual({
      query: {term: {active: false}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('birthDate="2020-06-11T12:30:15"'));
    expect(out).toStrictEqual({
      query: {term: {birthDate: '2020-06-11T12:30:15'}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('deleted=null'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {exists: {field: 'deleted'}}}}
    });
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    let out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName!="Demons"'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {term: {givenName: 'Demons'}}}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('deleted!=null'));
    expect(out).toStrictEqual({
      query: {bool: {exists: {field: 'deleted'}}}
    });
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate>5'));
    expect(out).toStrictEqual({
      query: {range: {rate: {gt: 5}}}
    });
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate>=5'));
    expect(out).toStrictEqual({
      query: {range: {rate: {gte: 5}}}
    });
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate<5'));
    expect(out).toStrictEqual({
      query: {range: {rate: {lt: 5}}}
    });
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate<=5'));
    expect(out).toStrictEqual({
      query: {range: {rate: {lte: 5}}}
    });
  });

  it('Should convert ComparisonExpression (in)', async () => {
    let out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate in [5,6]'));
    expect(out).toStrictEqual({
      query: {terms: {rate: [5, 6]}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate in 5'));
    expect(out).toStrictEqual({
      query: {terms: {rate: [5]}}
    });
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    let out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate !in [5,6]'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {terms: {rate: [5, 6]}}}}
    });
    out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate !in 5'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {terms: {rate: [5]}}}}
    });
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName like "Demons"'));
    expect(out).toStrictEqual({
      query: {wildcard: {givenName: 'Demons'}}
    });
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName !like "Demons"'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {wildcard: {givenName: 'Demons'}}}}
    });
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName ilike "Demons"'));
    expect(out).toStrictEqual({
      query: {wildcard: {givenName: {value: 'Demons', case_insensitive: true}}}
    });
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('givenName !ilike "Demons"'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {wildcard: {givenName: {value: 'Demons', case_insensitive: true}}}}}
    });
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate=1 or rate=2'));
    expect(out).toStrictEqual({
      query: {bool: {should: [{term: {rate: 1}}, {term: {rate: 2}}]}}
    });
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('rate=1 and rate=2'));
    expect(out).toStrictEqual({
      query: {bool: {must: [{term: {rate: 1}}, {term: {rate: 2}}]}}
    });
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = ElasticAdapter.transformFilter(customers.normalizeFilter('(rate=1 or rate=2) and givenName = "Demons"'));
    expect(out).toStrictEqual({
      query: {
        bool: {
          must: [
            {bool: {should: [{term: {rate: 1}}, {term: {rate: 2}}]}},
            {term: {givenName: 'Demons'}}
          ]
        }
      }
    });
  });

  it('Should convert NegativeExpression', async () => {
    let out = ElasticAdapter.transformFilter(customers.normalizeFilter('not rate=1'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {term: {rate: 1}}}}
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not rate=null'));
    expect(out).toStrictEqual({
      query: {bool: {exists: {field: 'rate'}}}
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not rate!=null'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {exists: {field: 'rate'}}}}
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not (rate=1 and active=true)'));
    expect(out).toStrictEqual({
      query: {
        bool: {
          must_not: [
            {term: {rate: 1}},
            {term: {active: true}}
          ]
        }
      }
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not (rate=1 or active=true)'));
    expect(out).toStrictEqual({
      query: {
        bool: {
          must_not: {
            bool: {
              should: [
                {term: {rate: 1}},
                {term: {active: true}}
              ]
            }
          }
        }
      }
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not givenName like "Demons"'));
    expect(out).toStrictEqual({
      query: {bool: {must_not: {wildcard: {givenName: 'Demons'}}}}
    });

    out = ElasticAdapter.transformFilter(customers.normalizeFilter('not givenName !like "Demons"'));
    expect(out).toStrictEqual({
      query: {wildcard: {givenName: 'Demons'}}
    });
  });


});

