import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.transformFilter', function () {

  it('Should convert StringLiteral', async () => {
    const out = MongoAdapter.transformFilter('name="Demons"')
    expect(out).toStrictEqual({name: 'Demons'});
  });

  it('Should convert NumberLiteral', async () => {
    const out = MongoAdapter.transformFilter('name=10');
    expect(out).toStrictEqual({name: 10});
  });

  it('Should convert BooleanLiteral', async () => {
    let out = MongoAdapter.transformFilter('hidden=true');
    expect(out).toStrictEqual({hidden: true});
    out = MongoAdapter.transformFilter('hidden=false');
    expect(out).toStrictEqual({hidden: false});
  });

  it('Should convert NullLiteral', async () => {
    const out = MongoAdapter.transformFilter('name=null');
    expect(out).toStrictEqual({name: null});
  });

  it('Should convert DateLiteral', async () => {
    const out = MongoAdapter.transformFilter('birthDate="2020-06-11T12:30:15"');
    expect(out).toStrictEqual({birthDate: '2020-06-11T12:30:15'});
  });

  it('Should convert TimeLiteral', async () => {
    const out = MongoAdapter.transformFilter('birthTime="12:30:15"');
    expect(out).toStrictEqual({birthTime: '12:30:15'});
  });

  it('Should convert ComparisonExpression (!=)', async () => {
    const out = MongoAdapter.transformFilter('name!="Demons"')
    expect(out).toStrictEqual({name: {$ne: 'Demons'}});
  });

  it('Should convert ComparisonExpression (>)', async () => {
    const out = MongoAdapter.transformFilter('page>5')
    expect(out).toStrictEqual({page: {$gt: 5}});
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = MongoAdapter.transformFilter('page>=5')
    expect(out).toStrictEqual({page: {$gte: 5}});
  });

  it('Should convert ComparisonExpression (<)', async () => {
    const out = MongoAdapter.transformFilter('page<5')
    expect(out).toStrictEqual({page: {$lt: 5}});
  });

  it('Should convert ComparisonExpression (>=)', async () => {
    const out = MongoAdapter.transformFilter('page<=5')
    expect(out).toStrictEqual({page: {$lte: 5}});
  });

  it('Should convert ComparisonExpression (in)', async () => {
    let out = MongoAdapter.transformFilter('page in [5,6]')
    expect(out).toStrictEqual({page: {$in: [5, 6]}});
    out = MongoAdapter.transformFilter('page in 5')
    expect(out).toStrictEqual({page: {$in: [5]}});
  });

  it('Should convert ComparisonExpression (!in)', async () => {
    let out = MongoAdapter.transformFilter('page !in [5,6]')
    expect(out).toStrictEqual({page: {$nin: [5, 6]}});
    out = MongoAdapter.transformFilter('page !in 5')
    expect(out).toStrictEqual({page: {$nin: [5]}});
  });

  it('Should convert ComparisonExpression (like)', async () => {
    const out = MongoAdapter.transformFilter('name like "Demons"')
    expect(out).toStrictEqual({name: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}});
  });

  it('Should convert ComparisonExpression (!like)', async () => {
    const out = MongoAdapter.transformFilter('name !like "Demons"')
    expect(out).toStrictEqual({name: {$not: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}}});
  });

  it('Should convert ComparisonExpression (ilike)', async () => {
    const out = MongoAdapter.transformFilter('name ilike "Demons"')
    expect(out).toStrictEqual({name: {$text: {$search: '\\"Demons\\"'}}});
  });

  it('Should convert ComparisonExpression (!ilike)', async () => {
    const out = MongoAdapter.transformFilter('name !ilike "Demons"')
    expect(out).toStrictEqual({name: {$not: {$text: {$search: '\\"Demons\\"'}}}});
  });

  it('Should convert LogicalExpression (or)', async () => {
    const out = MongoAdapter.transformFilter('page=1 or page=2')
    expect(out).toStrictEqual({$or: [{page: 1}, {page: 2}]});
  });

  it('Should convert LogicalExpression (and)', async () => {
    const out = MongoAdapter.transformFilter('page=1 and page=2')
    expect(out).toStrictEqual({$and: [{page: 1}, {page: 2}]});
  });

  it('Should convert ParenthesesExpression', async () => {
    const out = MongoAdapter.transformFilter('(page=1 or page=2) and name = "Demons"')
    expect(out).toStrictEqual({
      $and: [
        {$or: [{page: 1}, {page: 2}]},
        {name: 'Demons'}
      ]
    });
  });

});

