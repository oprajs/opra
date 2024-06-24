import { CustomerApplication } from 'express-mongo';
import { Validator } from 'valgen';
import { ApiDocument, HttpController } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.prepareFilter', function () {
  let document: ApiDocument;
  let customers: HttpController;
  let filterDecoder: Validator;

  beforeAll(async () => {
    document = (await CustomerApplication.create()).document;
    customers = document.api!.findController('customers')!;
    const findMany = customers.operations.get('findMany');
    const filterParam = findMany!.findParameter('filter');
    filterDecoder = filterParam!.type!.generateCodec('decode');
  });

  afterAll(() => global.gc && global.gc());

  describe('Convert Ast to mongo filter', function () {
    it('Should convert ComparisonExpression (=)', async () => {
      let out = MongoAdapter.prepareFilter(filterDecoder('givenName="Demons"'));
      expect(out).toStrictEqual({ givenName: 'Demons' });
      out = MongoAdapter.prepareFilter(filterDecoder('rate=10')!);
      expect(out).toStrictEqual({ rate: 10 });
      out = MongoAdapter.prepareFilter(filterDecoder('active=true')!);
      expect(out).toStrictEqual({ active: true });
      out = MongoAdapter.prepareFilter(filterDecoder('active=false')!);
      expect(out).toStrictEqual({ active: false });
      out = MongoAdapter.prepareFilter(filterDecoder('birthDate="2020-06-11T12:30:15"')!);
      expect(out).toStrictEqual({ birthDate: '2020-06-11T12:30:15' });
      out = MongoAdapter.prepareFilter(filterDecoder('deleted=null')!);
      expect(out).toStrictEqual({ $or: [{ deleted: null }, { deleted: { $exists: false } }] });
    });

    it('Should convert ComparisonExpression (!=)', async () => {
      let out = MongoAdapter.prepareFilter(filterDecoder('givenName!="Demons"')!);
      expect(out).toStrictEqual({ givenName: { $ne: 'Demons' } });
      out = MongoAdapter.prepareFilter(filterDecoder('deleted!=null')!);
      expect(out).toStrictEqual({ $and: [{ $ne: { deleted: null } }, { deleted: { $exists: true } }] });
    });

    it('Should convert ComparisonExpression (>)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate>5')!);
      expect(out).toStrictEqual({ rate: { $gt: 5 } });
    });

    it('Should convert ComparisonExpression (>=)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate>=5')!);
      expect(out).toStrictEqual({ rate: { $gte: 5 } });
    });

    it('Should convert ComparisonExpression (<)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate<5')!);
      expect(out).toStrictEqual({ rate: { $lt: 5 } });
    });

    it('Should convert ComparisonExpression (>=)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate<=5')!);
      expect(out).toStrictEqual({ rate: { $lte: 5 } });
    });

    it('Should convert ComparisonExpression (in)', async () => {
      let out = MongoAdapter.prepareFilter(filterDecoder('rate in [5,6]')!);
      expect(out).toStrictEqual({ rate: { $in: [5, 6] } });
      out = MongoAdapter.prepareFilter(filterDecoder('rate in 5')!);
      expect(out).toStrictEqual({ rate: { $in: [5] } });
    });

    it('Should convert ComparisonExpression (!in)', async () => {
      let out = MongoAdapter.prepareFilter(filterDecoder('rate !in [5,6]')!);
      expect(out).toStrictEqual({ rate: { $nin: [5, 6] } });
      out = MongoAdapter.prepareFilter(filterDecoder('rate !in 5')!);
      expect(out).toStrictEqual({ rate: { $nin: [5] } });
    });

    it('Should convert ComparisonExpression (like)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('givenName like "Demons"')!);
      expect(out).toStrictEqual({ givenName: { $text: { $caseSensitive: true, $search: '\\"Demons\\"' } } });
    });

    it('Should convert ComparisonExpression (!like)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('givenName !like "Demons"')!);
      expect(out).toStrictEqual({ givenName: { $not: { $text: { $caseSensitive: true, $search: '\\"Demons\\"' } } } });
    });

    it('Should convert ComparisonExpression (ilike)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('givenName ilike "Demons"')!);
      expect(out).toStrictEqual({ givenName: { $text: { $search: '\\"Demons\\"' } } });
    });

    it('Should convert ComparisonExpression (!ilike)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('givenName !ilike "Demons"')!);
      expect(out).toStrictEqual({ givenName: { $not: { $text: { $search: '\\"Demons\\"' } } } });
    });

    it('Should convert LogicalExpression (or)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate=1 or rate=2')!);
      expect(out).toStrictEqual({ $or: [{ rate: 1 }, { rate: 2 }] });
    });

    it('Should convert LogicalExpression (and)', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('rate=1 and rate=2')!);
      expect(out).toStrictEqual({ $and: [{ rate: 1 }, { rate: 2 }] });
    });

    it('Should convert ParenthesesExpression', async () => {
      const out = MongoAdapter.prepareFilter(filterDecoder('(rate=1 or rate=2) and givenName = "Demons"')!);
      expect(out).toStrictEqual({
        $and: [{ $or: [{ rate: 1 }, { rate: 2 }] }, { givenName: 'Demons' }],
      });
    });

    it('Should convert NegativeExpression', async () => {
      let out = MongoAdapter.prepareFilter(filterDecoder('not rate=1')!);
      expect(out).toStrictEqual({ rate: { $not: { $eq: 1 } } });
      out = MongoAdapter.prepareFilter(filterDecoder('not rate=null')!);
      expect(out).toStrictEqual({ $and: [{ $ne: { rate: null } }, { rate: { $exists: true } }] });
      out = MongoAdapter.prepareFilter(filterDecoder('not rate!=null')!);
      expect(out).toStrictEqual({ $or: [{ rate: null }, { rate: { $exists: false } }] });
      out = MongoAdapter.prepareFilter(filterDecoder('not (rate=1 and active=true)')!);
      expect(out).toStrictEqual({
        $and: [{ rate: { $not: { $eq: 1 } } }, { active: { $not: { $eq: true } } }],
      });
      out = MongoAdapter.prepareFilter(filterDecoder('not givenName like "Demons"')!);
      expect(out).toStrictEqual({
        givenName: { $not: { $text: { $caseSensitive: true, $search: '\\"Demons\\"' } } },
      });
      out = MongoAdapter.prepareFilter(filterDecoder('not givenName !like "Demons"')!);
      expect(out).toStrictEqual({
        givenName: { $text: { $caseSensitive: true, $search: '\\"Demons\\"' } },
      });
    });
  });

  describe('Merge multiple filters', function () {
    it('Should merge fields', async () => {
      const out = MongoAdapter.prepareFilter([{ a: 1 }, { b: 2 }]);
      expect(out).toStrictEqual({
        a: 1,
        b: 2,
      });
    });

    it('Should merge $and queries', async () => {
      const out = MongoAdapter.prepareFilter([{ $and: [{ $eq: 1 }] }, { $and: [{ $eq: 2 }] }]);
      expect(out).toStrictEqual({ $and: [{ $eq: 1 }, { $eq: 2 }] });
    });

    it('Should merge $or queries', async () => {
      const out = MongoAdapter.prepareFilter([{ $or: [{ $eq: 1 }] }, { $or: [{ $eq: 2 }] }]);
      expect(out).toStrictEqual({ $or: [{ $eq: 1 }, { $eq: 2 }] });
    });

    it('Should same fields into $and - 1', async () => {
      const out = MongoAdapter.prepareFilter([{ a: 1 }, { a: 2 }]);
      expect(out).toStrictEqual({ $and: [{ a: 1 }, { a: 2 }] });
    });

    it('Should same fields into $and - 2', async () => {
      const out = MongoAdapter.prepareFilter([{ a: { $lt: 5 } }, { a: { $gt: 1 } }]);
      expect(out).toStrictEqual({ $and: [{ a: { $lt: 5 } }, { a: { $gt: 1 } }] });
    });
  });
});
