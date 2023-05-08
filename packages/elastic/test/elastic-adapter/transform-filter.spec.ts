/* eslint-disable camelcase */
import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.transformFilter', function () {

  /*
   *
   */
  describe('ComparisonExpression (=)', function () {

    it('Should convert (field = String)', async () => {
      const out = ElasticAdapter.transformFilter('name="Demons"')
      expect(out).toStrictEqual({
        query: {
          term: {
            name: 'Demons'
          }
        }
      });
    });

    it('Should convert ComparisonExpression (field = Number)', async () => {
      const out = ElasticAdapter.transformFilter('age=1')
      expect(out).toStrictEqual({
        query: {
          term: {
            age: 1
          }
        }
      });
    });

    it('Should convert ComparisonExpression (field = Boolean)', async () => {
      const out = ElasticAdapter.transformFilter('active=true')
      expect(out).toStrictEqual({
        query: {
          term: {
            active: true
          }
        }
      });
    });

    it('Should convert ComparisonExpression (field = Null)', async () => {
      const out = ElasticAdapter.transformFilter('active=null')
      expect(out).toStrictEqual({
        query: {
          bool: {
            must_not: {
              exists: {
                field: 'active'
              }
            }
          }
        }
      });
    });

  });

  /*
  *
  */
  describe('ComparisonExpression (!=)', function () {
    it('Should convert (field != String)', async () => {
      const out = ElasticAdapter.transformFilter('name!="Demons"')
      expect(out).toStrictEqual({
        query: {
          bool: {
            must_not: {
              term: {
                name: 'Demons'
              }
            }
          }
        }
      });
    });
  });


  // it('Should convert DateLiteral', async () => {
  //   const out = ElasticAdapter.transformFilter('birthDate="2020-06-11T12:30:15"');
  //   expect(out).toStrictEqual({birthDate: '2020-06-11T12:30:15'});
  // });
  //
  // it('Should convert TimeLiteral', async () => {
  //   const out = ElasticAdapter.transformFilter('birthTime="12:30:15"');
  //   expect(out).toStrictEqual({birthTime: '12:30:15'});
  // });
  //
  // it('Should convert ComparisonExpression (!=)', async () => {
  //   const out = ElasticAdapter.transformFilter('name!="Demons"')
  //   expect(out).toStrictEqual({name: {$ne: 'Demons'}});
  // });
  //
  // it('Should convert ComparisonExpression (>)', async () => {
  //   const out = ElasticAdapter.transformFilter('page>5')
  //   expect(out).toStrictEqual({page: {$gt: 5}});
  // });
  //
  // it('Should convert ComparisonExpression (>=)', async () => {
  //   const out = ElasticAdapter.transformFilter('page>=5')
  //   expect(out).toStrictEqual({page: {$gte: 5}});
  // });
  //
  // it('Should convert ComparisonExpression (<)', async () => {
  //   const out = ElasticAdapter.transformFilter('page<5')
  //   expect(out).toStrictEqual({page: {$lt: 5}});
  // });
  //
  // it('Should convert ComparisonExpression (>=)', async () => {
  //   const out = ElasticAdapter.transformFilter('page<=5')
  //   expect(out).toStrictEqual({page: {$lte: 5}});
  // });
  //
  // it('Should convert ComparisonExpression (in)', async () => {
  //   let out = ElasticAdapter.transformFilter('page in [5,6]')
  //   expect(out).toStrictEqual({page: {$in: [5, 6]}});
  //   out = ElasticAdapter.transformFilter('page in 5')
  //   expect(out).toStrictEqual({page: {$in: [5]}});
  // });
  //
  // it('Should convert ComparisonExpression (!in)', async () => {
  //   let out = ElasticAdapter.transformFilter('page !in [5,6]')
  //   expect(out).toStrictEqual({page: {$nin: [5, 6]}});
  //   out = ElasticAdapter.transformFilter('page !in 5')
  //   expect(out).toStrictEqual({page: {$nin: [5]}});
  // });
  //
  // it('Should convert ComparisonExpression (like)', async () => {
  //   const out = ElasticAdapter.transformFilter('name like "Demons"')
  //   expect(out).toStrictEqual({name: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}});
  // });
  //
  // it('Should convert ComparisonExpression (!like)', async () => {
  //   const out = ElasticAdapter.transformFilter('name !like "Demons"')
  //   expect(out).toStrictEqual({name: {$not: {$text: {$caseSensitive: true, $search: '\\"Demons\\"'}}}});
  // });
  //
  // it('Should convert ComparisonExpression (ilike)', async () => {
  //   const out = ElasticAdapter.transformFilter('name ilike "Demons"')
  //   expect(out).toStrictEqual({name: {$text: {$search: '\\"Demons\\"'}}});
  // });
  //
  // it('Should convert ComparisonExpression (!ilike)', async () => {
  //   const out = ElasticAdapter.transformFilter('name !ilike "Demons"')
  //   expect(out).toStrictEqual({name: {$not: {$text: {$search: '\\"Demons\\"'}}}});
  // });
  //
  // it('Should convert LogicalExpression (or)', async () => {
  //   const out = ElasticAdapter.transformFilter('page=1 or page=2')
  //   expect(out).toStrictEqual({$or: [{page: 1}, {page: 2}]});
  // });
  //
  // it('Should convert LogicalExpression (and)', async () => {
  //   const out = ElasticAdapter.transformFilter('page=1 and page=2')
  //   expect(out).toStrictEqual({$and: [{page: 1}, {page: 2}]});
  // });
  //
  // it('Should convert ParenthesesExpression', async () => {
  //   const out = ElasticAdapter.transformFilter('(page=1 or page=2) and name = "Demons"')
  //   expect(out).toStrictEqual({
  //     $and: [
  //       {$or: [{page: 1}, {page: 2}]},
  //       {name: 'Demons'}
  //     ]
  //   });
  // });

});

