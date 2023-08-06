/* eslint-disable import/no-duplicates */
import '@opra/core';
import { ApiDocument, Collection } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import {
  And, Eq, Gt, Gte, Ilike, In, Like, Lt, Lte, Ne, Nin, NLike, Not, NotILike, Or,
} from '@sqb/builder';
import { createTestApp } from '../_support/test-app/index.js';

describe('SQBAdapter.convertFilter', function () {

  let api: ApiDocument;
  let customers: Collection;

  beforeAll(async () => {
    const app = await createTestApp();
    api = app.api;
    customers = api.getCollection('customers');
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName="Demons"'))
    expect(out).toStrictEqual(Eq('givenName', 'Demons'));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('deleted=null'))
    expect(out).toStrictEqual(Eq('deleted', null));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=10'))
    expect(out).toStrictEqual(Eq('rate', 10));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('active=true'))
    expect(out).toStrictEqual(Eq('active', true));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('active=false'))
    expect(out).toStrictEqual(Eq('active', false));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('birthDate="2020-06-11T12:30:15"'))
    expect(out).toStrictEqual(Eq('birthDate', '2020-06-11T12:30:15'));
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName!="Demons"'))
    expect(out).toStrictEqual(Ne('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate>5'));
    expect(out).toStrictEqual(Gt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate>=5'));
    expect(out).toStrictEqual(Gte('rate', 5));
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate<5'));
    expect(out).toStrictEqual(Lt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate<=5'));
    expect(out).toStrictEqual(Lte('rate', 5));
  });

  it('Should convert ComparisonExpression (in)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate in [5,6]'));
    expect(out).toStrictEqual(In('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate !in [5,6]'));
    expect(out).toStrictEqual(Nin('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName like "Demons*"'));
    expect(out).toStrictEqual(Like('givenName', 'Demons%'));
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName !like "*Demons"'));
    expect(out).toStrictEqual(NLike('givenName', '%Demons'));
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName ilike "Demons"'));
    expect(out).toStrictEqual(Ilike('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('givenName !ilike "Demons"'));
    expect(out).toStrictEqual(NotILike('givenName', 'Demons'));
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=1 or rate=2'));
    expect(out).toStrictEqual(Or(Eq('rate', 1), Eq('rate', 2)));
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('rate=1 and active=true'));
    expect(out).toStrictEqual(And(Eq('rate', 1), Eq('active', true)));
  });

  it('Should convert NegativeExpression', async () => {
    let out = SQBAdapter.transformFilter(customers.normalizeFilter('not rate=1'));
    expect(out).toStrictEqual(Not(Eq('rate', 1)));
    out = SQBAdapter.transformFilter(customers.normalizeFilter('not (rate=1 and active=true)'));
    expect(out).toStrictEqual(Not(And(Eq('rate', 1), Eq('active', true))));
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = SQBAdapter.transformFilter(customers.normalizeFilter('(rate=1 or rate=2) and givenName = "Demons"'));
    expect(out).toStrictEqual(And(
            Or(Eq('rate', 1), Eq('rate', 2)),
            Eq('givenName', 'Demons')
        )
    );
  });

});

