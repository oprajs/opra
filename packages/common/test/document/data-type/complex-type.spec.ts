/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocument, parseFieldsProjection } from '@opra/common';
import { TestApiDocument } from '../../_support/test-api/index.js';

describe('ComplexType', function () {
  let doc: ApiDocument;

  beforeAll(async () => {
    doc = await TestApiDocument.create();
  });

  afterAll(() => global.gc && global.gc());

  it('Should findField(name) return field instance', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('countryCode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  });

  it('Should findField(name) do case-insensitive search', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('countrycode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  });

  it('Should findField(path) return nested fields', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('country.phonecode');
    expect(f).toBeDefined();
    expect(f!.owner!.name).toStrictEqual('Country');
    expect(f!.name).toStrictEqual('phoneCode');
  });

  it('Should findField(path) return "undefined" if field not found', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(dt!.findField('nofield')).not.toBeDefined();
  });

  it('Should getField(path) throw if field not found', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(() => dt!.getField('nofield')).toThrow('UNKNOWN_FIELD');
  });

  it('Should getField(path) throw if given path is not valid', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(() => dt!.getField('givenName.code')).toThrow('field is not');
  });

  it('Should normalizeFieldPath() return normalized field name array', async () => {
    const dt = doc.node.getComplexType('customer');
    expect(dt).toBeDefined();
    let x: any = dt!.normalizeFieldPath('countrycode');
    expect(x).toBeDefined();
    expect(x).toStrictEqual('countryCode');
    expect(dt).toBeDefined();
    x = dt!.normalizeFieldPath('address.countrycode');
    expect(x).toBeDefined();
    expect(x).toStrictEqual('address.countryCode');
  });

  it('Should exportSchema() return schema', async () => {
    const dt = doc.node.getComplexType('country');
    expect(dt).toBeDefined();
    const x = dt!.toJSON();
    expect(x).toBeDefined();
    expect(x).toStrictEqual({
      kind: 'ComplexType',
      description: 'Country information',
      fields: {
        code: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        phoneCode: {
          type: 'string',
        },
      },
    });
  });

  describe('_generateSchema()', () => {
    it('Should _generate ValGen schema', async () => {
      const dt = doc.node.getComplexType('Note');
      const x: any = (dt as any)._generateSchema('decode', {});
      expect(x).toBeDefined();
      expect(Object.keys(x)).toStrictEqual([
        '_id',
        'deleted',
        'createdAt',
        'updatedAt',
        'title',
        'text',
        'rank',
        'largeContent',
      ]);
    });

    it('Should ignore exclusive fields by default', async () => {
      const dt = doc.node.getComplexType('Note');
      const x: any = (dt as any)._generateSchema('decode', {});
      expect(x).toBeDefined();
      expect(x.title(1)).toStrictEqual('1');
      expect(x.largeContent(1)).toStrictEqual(undefined);
      expect(x.text(1)).toStrictEqual('1');
      expect(x.rank(1)).toStrictEqual(1);
    });

    it('Should pick fields using projection', async () => {
      const dt = doc.node.getComplexType('Note');
      const x: any = (dt as any)._generateSchema('decode', {
        projection: parseFieldsProjection(['title', 'largecontent']),
      });
      expect(x).toBeDefined();
      expect(x.title(1)).toStrictEqual('1');
      expect(x.largeContent(1)).toStrictEqual('1');
      expect(x.text(1)).toStrictEqual(undefined);
      expect(x.rank(1)).toStrictEqual(undefined);
    });

    it('Should omit fields using projection', async () => {
      const dt = doc.node.getComplexType('Note');
      const x: any = (dt as any)._generateSchema('decode', {
        projection: parseFieldsProjection(['-title']),
      });
      expect(x).toBeDefined();
      expect(x.title(1)).toStrictEqual(undefined);
      expect(x.largeContent(1)).toStrictEqual(undefined);
      expect(x.text(1)).toStrictEqual('1');
      expect(x.rank(1)).toStrictEqual(1);
    });

    it('Should include exclusive fields using projection', async () => {
      const dt = doc.node.getComplexType('Note');
      const x: any = (dt as any)._generateSchema('decode', {
        projection: parseFieldsProjection(['+largecontent']),
      });
      expect(x).toBeDefined();
      expect(x.title(1)).toStrictEqual('1');
      expect(x.largeContent(1)).toStrictEqual('1');
      expect(x.text(1)).toStrictEqual('1');
      expect(x.rank(1)).toStrictEqual(1);
    });
  });
});
