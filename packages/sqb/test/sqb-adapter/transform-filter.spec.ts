/* eslint-disable import/no-duplicates */
import '@opra/core';
import { ApiDocument, Collection } from '@opra/common';
import { createTestApi } from '@opra/core/test/_support/test-app/index';
import { SQBAdapter } from '@opra/sqb';
import {
  And, Eq, Field, Gt, Gte, Ilike, In, Like, Lt, Lte, Ne, Nin, NLike, Not, NotILike, Or,
} from '@sqb/builder';

describe('SQBAdapter.convertFilter', function () {

  let api: ApiDocument;
  let customers: Collection;

  beforeAll(async () => {
    api = await createTestApi();
    customers = api.getCollection('customers');
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName="Demons"'))
    expect(out).toStrictEqual(Eq(Field('givenName'), 'Demons'));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('deleted=null'))
    expect(out).toStrictEqual(Eq(Field('deleted'), null));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=10'))
    expect(out).toStrictEqual(Eq(Field('rate'), 10));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('active=true'))
    expect(out).toStrictEqual(Eq(Field('active'), true));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('active=false'))
    expect(out).toStrictEqual(Eq(Field('active'), false));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('birthDate="2020-06-11T12:30:15"'))
    expect(out).toStrictEqual(Eq(Field('birthDate'), '2020-06-11T12:30:15'));
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName!="Demons"'))
    expect(out).toStrictEqual(Ne(Field('givenName'), 'Demons'));
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate>5'));
    expect(out).toStrictEqual(Gt(Field('rate'), 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate>=5'));
    expect(out).toStrictEqual(Gte(Field('rate'), 5));
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate<5'));
    expect(out).toStrictEqual(Lt(Field('rate'), 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate<=5'));
    expect(out).toStrictEqual(Lte(Field('rate'), 5));
  });

  it('Should convert ComparisonExpression (in)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate in [5,6]'));
    expect(out).toStrictEqual(In(Field('rate'), [5, 6]));
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate !in [5,6]'));
    expect(out).toStrictEqual(Nin(Field('rate'), [5, 6]));
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName like "Demons*"'));
    expect(out).toStrictEqual(Like(Field('givenName'), 'Demons%'));
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName !like "*Demons"'));
    expect(out).toStrictEqual(NLike(Field('givenName'), '%Demons'));
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName ilike "Demons"'));
    expect(out).toStrictEqual(Ilike(Field('givenName'), 'Demons'));
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName !ilike "Demons"'));
    expect(out).toStrictEqual(NotILike(Field('givenName'), 'Demons'));
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=1 or rate=2'));
    expect(out).toStrictEqual(Or(Eq(Field('rate'), 1), Eq(Field('rate'), 2)));
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=1 and active=true'));
    expect(out).toStrictEqual(And(Eq(Field('rate'), 1), Eq(Field('active'), true)));
  });

  it('Should convert NegativeExpression', async () => {
    let out = SQBAdapter.transformFilter(customers.normalizeFilter('not rate=1'));
    expect(out).toStrictEqual(Not(Eq(Field('rate'), 1)));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('not (rate=1 and active=true)'));
    expect(out).toStrictEqual(Not(And(Eq(Field('rate'), 1), Eq(Field('active'), true))));
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('(rate=1 or rate=2) and givenName = "Demons"'));
    expect(out).toStrictEqual(And(
            Or(Eq(Field('rate'), 1), Eq(Field('rate'), 2)),
            Eq(Field('givenName'), 'Demons')
        )
    );
  });

});

