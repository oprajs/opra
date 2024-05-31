/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocument, ApiDocumentFactory, OpraSchema } from '@opra/common';
import { Address, Country, Customer, GenderEnum, Note, Person, Record } from '../../_support/test-api/index.js';

describe('ComplexType', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    },
    types: [Record, Person, GenderEnum, Address, Note, Country, Customer],
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  });

  afterAll(() => global.gc && global.gc());

  it('Should findField(name) return field instance', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('countryCode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  });

  it('Should findField(name) do case-insensitive search', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('countrycode');
    expect(f).toBeDefined();
    expect(f!.name).toStrictEqual('countryCode');
  });

  it('Should findField(path) return nested fields', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    const f = dt!.findField('country.phonecode');
    expect(f).toBeDefined();
    expect(f!.owner!.name).toStrictEqual('Country');
    expect(f!.name).toStrictEqual('phoneCode');
  });

  it('Should findField(path) return "undefined" if field not found', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(dt!.findField('nofield')).not.toBeDefined();
  });

  it('Should getField(path) throw if field not found', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(() => dt!.getField('nofield')).toThrow('UNKNOWN_FIELD');
  });

  it('Should getField(path) throw if given path is not valid', async () => {
    const dt = api.node.getComplexType('customer');
    expect(dt).toBeDefined();
    expect(() => dt!.getField('givenName.code')).toThrow('field is not');
  });

  it('Should normalizeFieldPath() return normalized field name array', async () => {
    const dt = api.node.getComplexType('customer');
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
    const dt = api.node.getComplexType('country');
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

  it('Should _generateSchema() return ValGen schema', async () => {
    const dt = api.node.getComplexType('customer');
    const x: any = (dt as any)._generateSchema('decode', {});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual([
      '_id',
      'deleted',
      'createdAt',
      'updatedAt',
      'givenName',
      'familyName',
      'gender',
      'birthDate',
      'uid',
      'active',
      'countryCode',
      'rate',
      'fillerDate',
      'address',
      'notes',
      'country',
    ]);
  });
});
