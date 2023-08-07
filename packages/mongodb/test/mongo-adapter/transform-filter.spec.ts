import { ApiDocument, Collection } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../../../sqb/test/_support/test-app/index.js';

describe('MongoAdapter.transformFilter', function () {

  let api: ApiDocument;
  let customers: Collection;

  beforeAll(async () => {
    const app = await createTestApp();
    api = app.api;
    customers = api.getCollection('customers');
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName="Demons"'));
    expect(out).toStrictEqual({givenName: 'Demons'});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('rate=10'));
    expect(out).toStrictEqual({rate: 10});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('active=true'));
    expect(out).toStrictEqual({active: true});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('active=false'));
    expect(out).toStrictEqual({active: false});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('birthDate="2020-06-11T12:30:15"'));
    expect(out).toStrictEqual({birthDate: '2020-06-11T12:30:15'});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('deleted=null'));
    expect(out).toStrictEqual({$or: [{deleted: null}, {deleted: {$exists: false}}]});
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    let out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName!="Demons"'));
    expect(out).toStrictEqual({givenName: {$ne: 'Demons'}});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('deleted!=null'));
    expect(out).toStrictEqual({$and: [{$ne: {deleted: null}}, {deleted: {$exists: true}}]});
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate>5'));
    expect(out).toStrictEqual({rate: {$gt: 5}});
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate>=5'));
    expect(out).toStrictEqual({rate: {$gte: 5}});
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate<5'));
    expect(out).toStrictEqual({rate: {$lt: 5}});
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate<=5'));
    expect(out).toStrictEqual({rate: {$lte: 5}});
  });

  it('Should convert ComparisonExpression (in)', async () => {
    let out = MongoAdapter.transformFilter(customers.normalizeFilter('rate in [5,6]'));
    expect(out).toStrictEqual({rate: {$in: [5, 6]}});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('rate in 5'));
    expect(out).toStrictEqual({rate: {$in: [5]}});
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    let out = MongoAdapter.transformFilter(customers.normalizeFilter('rate !in [5,6]'));
    expect(out).toStrictEqual({rate: {$nin: [5, 6]}});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('rate !in 5'));
    expect(out).toStrictEqual({rate: {$nin: [5]}});
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName like "Demons"'));
    expect(out).toStrictEqual({givenName: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}});
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName !like "Demons"'));
    expect(out).toStrictEqual({givenName: {$not: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}}});
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName ilike "Demons"'));
    expect(out).toStrictEqual({givenName: {$text: {$search: '\\"Demons\\"'}}});
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('givenName !ilike "Demons"'));
    expect(out).toStrictEqual({givenName: {$not: {$text: {$search: '\\"Demons\\"'}}}});
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate=1 or rate=2'));
    expect(out).toStrictEqual({$or: [{rate: 1}, {rate: 2}]});
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('rate=1 and rate=2'));
    expect(out).toStrictEqual({$and: [{rate: 1}, {rate: 2}]});
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = MongoAdapter.transformFilter(customers.normalizeFilter('(rate=1 or rate=2) and givenName = "Demons"'));
    expect(out).toStrictEqual({
      $and: [
        {$or: [{rate: 1}, {rate: 2}]},
        {givenName: 'Demons'}
      ]
    });
  });

  it('Should convert NegativeExpression', async () => {
    let out = MongoAdapter.transformFilter(customers.normalizeFilter('not rate=1'));
    expect(out).toStrictEqual({rate: {$not: {$eq: 1}}});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('not rate=null'));
    expect(out).toStrictEqual({$and: [{$ne: {rate: null}}, {rate: {$exists: true}}]});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('not rate!=null'));
    expect(out).toStrictEqual({$or: [{rate: null}, {rate: {$exists: false}}]});
    out = MongoAdapter.transformFilter(customers.normalizeFilter('not (rate=1 and active=true)'));
    expect(out).toStrictEqual({
      $and: [
        {rate: {$not: {$eq: 1}}},
        {active: {$not: {$eq: true}}}
      ]
    });
    out = MongoAdapter.transformFilter(customers.normalizeFilter('not givenName like "Demons"'));
    expect(out).toStrictEqual({
      givenName:
          {$not: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}}
    });
    out = MongoAdapter.transformFilter(customers.normalizeFilter('not givenName !like "Demons"'));
    expect(out).toStrictEqual({
      givenName:
          {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}
    });
  });

});

