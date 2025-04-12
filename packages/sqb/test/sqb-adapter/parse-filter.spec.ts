import '@opra/core';
import { ApiDocument, HttpController } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import {
  And,
  Eq,
  Gt,
  Gte,
  Ilike,
  In,
  Like,
  Lt,
  Lte,
  Ne,
  Nin,
  NLike,
  Not,
  NotILike,
  Or,
} from '@sqb/builder';
import { expect } from 'expect';
import { CustomerApplication } from 'express-sqb';
import { Validator } from 'valgen';

describe('SQBAdapter.prepareFilter', () => {
  let document: ApiDocument;
  let customers: HttpController;
  let filterDecoder: Validator;

  before(async () => {
    document = (await CustomerApplication.create()).document;
    customers = document.httpApi!.findController('customers')!;
    const findMany = customers.operations.get('findMany');
    const filterParam = findMany!.findParameter('filter');
    filterDecoder = filterParam!.type!.generateCodec('decode');
  });

  it('Should parse from string', async () => {
    let out = SQBAdapter.prepareFilter('givenName="Demons"');
    expect(out).toStrictEqual(Eq('givenName', 'Demons'));
    out = SQBAdapter.prepareFilter('deleted=null');
    expect(out).toStrictEqual(Eq('deleted', null));
    out = SQBAdapter.prepareFilter('rate=10');
    expect(out).toStrictEqual(Eq('rate', 10));
    out = SQBAdapter.prepareFilter('active=true');
    expect(out).toStrictEqual(Eq('active', true));
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = SQBAdapter.prepareFilter(filterDecoder('givenName="Demons"'));
    expect(out).toStrictEqual(Eq('givenName', 'Demons'));
    out = SQBAdapter.prepareFilter(filterDecoder('deleted=null'));
    expect(out).toStrictEqual(Eq('deleted', null));
    out = SQBAdapter.prepareFilter(filterDecoder('rate=10'));
    expect(out).toStrictEqual(Eq('rate', 10));
    out = SQBAdapter.prepareFilter(filterDecoder('active=true'));
    expect(out).toStrictEqual(Eq('active', true));
    out = SQBAdapter.prepareFilter(filterDecoder('active=false'));
    expect(out).toStrictEqual(Eq('active', false));
    out = SQBAdapter.prepareFilter(
      filterDecoder('birthDate="2020-06-11T12:30:15"'),
    );
    expect(out).toStrictEqual(Eq('birthDate', new Date('2020-06-11T12:30:15')));
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('givenName!="Demons"'));
    expect(out).toStrictEqual(Ne('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate>5'));
    expect(out).toStrictEqual(Gt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate>=5'));
    expect(out).toStrictEqual(Gte('rate', 5));
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate<5'));
    expect(out).toStrictEqual(Lt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate<=5'));
    expect(out).toStrictEqual(Lte('rate', 5));
  });

  it('Should convert ComparisonExpression (in)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate in [5,6]'));
    expect(out).toStrictEqual(In('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate !in [5,6]'));
    expect(out).toStrictEqual(Nin('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName like "Demons*"'),
    );
    expect(out).toStrictEqual(Like('givenName', 'Demons%'));
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName !like "*Demons"'),
    );
    expect(out).toStrictEqual(NLike('givenName', '%Demons'));
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName ilike "Demons"'),
    );
    expect(out).toStrictEqual(Ilike('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName !ilike "Demons"'),
    );
    expect(out).toStrictEqual(NotILike('givenName', 'Demons'));
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate=1 or rate=2'));
    expect(out).toStrictEqual(Or(Eq('rate', 1), Eq('rate', 2)));
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('rate=1 and active=true'),
    );
    expect(out).toStrictEqual(And(Eq('rate', 1), Eq('active', true)));
  });

  it('Should convert NegativeExpression', async () => {
    let out = SQBAdapter.prepareFilter(filterDecoder('not rate=1'));
    expect(out).toStrictEqual(Not(Eq('rate', 1)));
    out = SQBAdapter.prepareFilter(
      filterDecoder('not (rate=1 and active=true)'),
    );
    expect(out).toStrictEqual(Not(And(Eq('rate', 1), Eq('active', true))));
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('(rate=1 or rate=2) and givenName = "Demons"'),
    );
    expect(out).toStrictEqual(
      And(Or(Eq('rate', 1), Eq('rate', 2)), Eq('givenName', 'Demons')),
    );
  });
});
