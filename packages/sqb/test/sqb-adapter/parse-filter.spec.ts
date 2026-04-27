import '@opra/core';
import { ApiDocument, HttpController } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import { sql } from '@sqb/builder';
import { CustomerApplication } from 'example-express-sqb';
import { expect } from 'expect';
import { Validator } from 'valgen';

describe('sqb:SQBAdapter.prepareFilter', () => {
  let document: ApiDocument;
  let customers: HttpController;
  let filterDecoder: Validator;

  before(async () => {
    document = (await CustomerApplication.create()).document;
    customers = document.getHttpApi().findController('customers')!;
    const findMany = customers.operations.get('findMany');
    const filterParam = findMany!.findParameter('filter');
    filterDecoder = filterParam!.generateCodec('decode');
  });

  it('Should parse from string', async () => {
    let out = SQBAdapter.prepareFilter('givenName="Demons"');
    expect(out).toStrictEqual(sql.Eq('givenName', 'Demons'));
    out = SQBAdapter.prepareFilter('deleted=null');
    expect(out).toStrictEqual(sql.Eq('deleted', null));
    out = SQBAdapter.prepareFilter('rate=10');
    expect(out).toStrictEqual(sql.Eq('rate', 10));
    out = SQBAdapter.prepareFilter('active=true');
    expect(out).toStrictEqual(sql.Eq('active', true));
  });

  it('Should convert ComparisonExpression (=)', async () => {
    let out = SQBAdapter.prepareFilter(filterDecoder('givenName="Demons"'));
    expect(out).toStrictEqual(sql.Eq('givenName', 'Demons'));
    out = SQBAdapter.prepareFilter(filterDecoder('deleted=null'));
    expect(out).toStrictEqual(sql.Eq('deleted', null));
    out = SQBAdapter.prepareFilter(filterDecoder('rate=10'));
    expect(out).toStrictEqual(sql.Eq('rate', 10));
    out = SQBAdapter.prepareFilter(filterDecoder('active=true'));
    expect(out).toStrictEqual(sql.Eq('active', true));
    out = SQBAdapter.prepareFilter(filterDecoder('active=false'));
    expect(out).toStrictEqual(sql.Eq('active', false));
    out = SQBAdapter.prepareFilter(
      filterDecoder('birthDate="2020-06-11T12:30:15"'),
    );
    expect(out).toStrictEqual(
      sql.Eq('birthDate', new Date('2020-06-11T00:00:00')),
    );
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('givenName!="Demons"'));
    expect(out).toStrictEqual(sql.Ne('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate>5'));
    expect(out).toStrictEqual(sql.Gt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate>=5'));
    expect(out).toStrictEqual(sql.Gte('rate', 5));
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate<5'));
    expect(out).toStrictEqual(sql.Lt('rate', 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate<=5'));
    expect(out).toStrictEqual(sql.Lte('rate', 5));
  });

  it('Should convert ComparisonExpression (in)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate in [5,6]'));
    expect(out).toStrictEqual(sql.In('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate !in [5,6]'));
    expect(out).toStrictEqual(sql.NotIn('rate', [5, 6]));
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName like "Demons*"'),
    );
    expect(out).toStrictEqual(sql.Like('givenName', 'Demons%'));
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName !like "*Demons"'),
    );
    expect(out).toStrictEqual(sql.NotLike('givenName', '%Demons'));
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName ilike "Demons"'),
    );
    expect(out).toStrictEqual(sql.ILike('givenName', 'Demons'));
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('givenName !ilike "Demons"'),
    );
    expect(out).toStrictEqual(sql.NotILike('givenName', 'Demons'));
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = SQBAdapter.prepareFilter(filterDecoder('rate=1 or rate=2'));
    expect(out).toStrictEqual(sql.Or(sql.Eq('rate', 1), sql.Eq('rate', 2)));
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('rate=1 and active=true'),
    );
    expect(out).toStrictEqual(
      sql.And(sql.Eq('rate', 1), sql.Eq('active', true)),
    );
  });

  it('Should convert NegativeExpression', async () => {
    let out = SQBAdapter.prepareFilter(filterDecoder('not rate=1'));
    expect(out).toStrictEqual(sql.Not(sql.Eq('rate', 1)));
    out = SQBAdapter.prepareFilter(
      filterDecoder('not (rate=1 and active=true)'),
    );
    expect(out).toStrictEqual(
      sql.Not(sql.And(sql.Eq('rate', 1), sql.Eq('active', true))),
    );
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = SQBAdapter.prepareFilter(
      filterDecoder('(rate=1 or rate=2) and givenName = "Demons"'),
    );
    expect(out).toStrictEqual(
      sql.And(
        sql.Or(sql.Eq('rate', 1), sql.Eq('rate', 2)),
        sql.Eq('givenName', 'Demons'),
      ),
    );
  });
});
