/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
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

});
