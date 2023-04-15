import {
  And, Eq, Field, Gt, Gte, Ilike, In, Like, Lt, Lte, Ne, Nin, NLike, NotILike, Or,
} from '@sqb/builder';
import { convertFilter } from '../src/convert-filter.js';

describe('SQBAdapter.convertFilter', function () {

  it('Should convert StringLiteral', async () => {
    const out = convertFilter('name="Demons"')
    expect(out).toStrictEqual(Eq(Field('name'), 'Demons'));
  });

  it('Should convert NumberLiteral', async () => {
    const out = convertFilter('name=10');
    expect(out).toStrictEqual(Eq(Field('name'), 10));
  });

  it('Should convert BooleanLiteral', async () => {
    let out = convertFilter('hidden=true');
    expect(out).toStrictEqual(Eq(Field('hidden'), true));
    out = convertFilter('hidden=false');
    expect(out).toStrictEqual(Eq(Field('hidden'), false));
  });

  it('Should convert NullLiteral', async () => {
    const out = convertFilter('name=null');
    expect(out).toStrictEqual(Eq(Field('name'), null));
  });

  it('Should convert DateLiteral', async () => {
    const out = convertFilter('birthDate="2020-06-11T12:30:15"');
    expect(out).toStrictEqual(Eq(Field('birthDate'), '2020-06-11T12:30:15'));
  });

  it('Should convert TimeLiteral', async () => {
    const out = convertFilter('birthTime="12:30:15"');
    expect(out).toStrictEqual(Eq(Field('birthTime'), '12:30:15'));
  });

  it('Should convert ComparisonExpression (=)', async () => {
    const out = convertFilter('name="Demons"')
    expect(out).toStrictEqual(Eq(Field('name'), 'Demons'));
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = convertFilter('name!="Demons"')
    expect(out).toStrictEqual(Ne(Field('name'), 'Demons'));
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = convertFilter('page>5')
    expect(out).toStrictEqual(Gt(Field('page'), 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = convertFilter('page>=5')
    expect(out).toStrictEqual(Gte(Field('page'), 5));
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = convertFilter('page<5')
    expect(out).toStrictEqual(Lt(Field('page'), 5));
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = convertFilter('page<=5')
    expect(out).toStrictEqual(Lte(Field('page'), 5));
  });

  it('Should convert ComparisonExpression (in)', async () => {
    const out = convertFilter('page in [5,6]')
    expect(out).toStrictEqual(In(Field('page'), [5, 6]));
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    const out = convertFilter('page !in [5,6]')
    expect(out).toStrictEqual(Nin(Field('page'), [5, 6]));
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = convertFilter('name like "Demons"')
    expect(out).toStrictEqual(Like(Field('name'), 'Demons'));
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = convertFilter('name !like "Demons"')
    expect(out).toStrictEqual(NLike(Field('name'), 'Demons'));
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = convertFilter('name ilike "Demons"')
    expect(out).toStrictEqual(Ilike(Field('name'), 'Demons'));
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = convertFilter('name !ilike "Demons"')
    expect(out).toStrictEqual(NotILike(Field('name'), 'Demons'));
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = convertFilter('page=1 or page=2')
    expect(out).toStrictEqual(Or(Eq(Field('page'), 1), Eq(Field('page'), 2)));
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = convertFilter('page=1 and active=true')
    expect(out).toStrictEqual(And(Eq(Field('page'), 1), Eq(Field('active'), true)));
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = convertFilter('(page=1 or page=2) and name = "Demons"')
    expect(out).toStrictEqual(And(
            Or(Eq(Field('page'), 1), Eq(Field('page'), 2)),
            Eq(Field('name'), 'Demons')
        )
    );
  });

});

