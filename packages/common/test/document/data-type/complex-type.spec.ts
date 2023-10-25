/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory, ComplexType,
  OpraSchema,
} from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';

describe('ComplexType', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    },
    types: [Customer]
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  afterAll(() => global.gc && global.gc());

  it('Should findField(name) return field instance', async () => {
    const dt = api.getComplexType('customer');
    const f = dt.findField('countryCode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  })

  it('Should findField(name) do case-insensitive search', async () => {
    const dt = api.getComplexType('customer');
    const f = dt.findField('countrycode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  })

  it('Should findField(path) return nested fields', async () => {
    const dt = api.getComplexType('customer');
    const f = dt.findField('country.phonecode');
    expect(f).toBeDefined();
    expect(f!.owner.name).toStrictEqual('Country');
    expect(f!.name).toStrictEqual('phoneCode');
  })

  it('Should findField(path) return "undefined" if field not found', async () => {
    const dt = api.getComplexType('customer');
    expect(dt.findField('nofield')).not.toBeDefined();
  })

  it('Should getField(path) throw if field not found', async () => {
    const dt = api.getComplexType('customer');
    expect(() => dt.getField('nofield')).toThrow('UNKNOWN_FIELD');
  })

  it('Should getField(path) throw if given path is not valid', async () => {
    const dt = api.getComplexType('customer');
    expect(() => dt.getField('givenName.code')).toThrow('field is not');
  })

  it('Should normalizeFieldPath() return normalized field name array', async () => {
    const dt = api.getComplexType('customer');
    let x: any = dt.normalizeFieldPath('countrycode');
    expect(x).toBeDefined();
    expect(x).toStrictEqual(['countryCode']);
    x = dt.normalizeFieldPath(['givenname', 'countrycode']);
    expect(x).toBeDefined();
    expect(x).toStrictEqual(['givenName', 'countryCode']);
  })

  it('Should exportSchema() return schema', async () => {
    const dt = api.getComplexType('country');
    const x = dt.exportSchema();
    expect(x).toBeDefined();
    expect(x).toStrictEqual({
      kind: 'ComplexType',
      description: 'Country information',
      fields: {
        code: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        phoneCode: {
          type: 'string'
        }
      }
    })
  })

  it('Should _generateCodecSchema() return ValGen schema', async () => {
    const dt = api.getComplexType('customer');
    const x: any = (dt as any)._generateCodecSchema('decode');
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual([
      "_id",
      "deleted",
      "createdAt",
      "updatedAt",
      "givenName",
      "familyName",
      "gender",
      "birthDate",
      "uid",
      "active",
      "countryCode",
      "rate",
      "address",
      "notes",
      "country"
    ]);
  })

  it('Should pick properties in _generateCodecSchema()', async () => {
    const dt = api.getComplexType('customer');
    const x: any = (dt as any)._generateCodecSchema('decode', {pick: ['deleted', 'address.city']});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual([
      "deleted",
      "address",
    ]);
  })

  it('Should omit properties in _generateCodecSchema()', async () => {
    const dt = api.getComplexType('customer');
    const x: any = (dt as any)._generateCodecSchema('decode', {omit: ['deleted', 'notes', 'address.city']});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual([
      "_id",
      "createdAt",
      "updatedAt",
      "givenName",
      "familyName",
      "gender",
      "birthDate",
      "uid",
      "active",
      "countryCode",
      "rate",
      "address",
      "country"
    ]);
  })


  it('Should overwrite fields in _generateCodecSchema()', async () => {
    const odt = new ComplexType(api, {
      fields: {
        rate: {
          name: 'rate',
          type: api.getDataType('string'),
          required: true,
        }
      }
    });
    const dt = api.getComplexType('customer');
    const x: any = (dt as any)._generateCodecSchema('decode', {overwriteFields: odt.fields});
    expect(x.rate).toBeDefined();
    expect(x.rate(3.1, {coerce: true})).toStrictEqual('3.1');
    expect(() => x.rate()).toThrow('required');
  })

});
