/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';
import { Customer, CustomersController } from '../../_support/test-api/index.js';

describe('CollectionClass', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    },
    types: [Customer],
    root: {
      resources: [CustomersController]
    }
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  afterAll(() => global.gc && global.gc());

  describe('normalizeFieldNames()', function () {
    it('Should return normalized field names', async () => {
      const resource = api.getCollection('customers');
      const x: any = resource.normalizeFieldNames(['address.City', 'familyname']);
      expect(x).toBeDefined();
      expect(x).toStrictEqual(['address.city', 'familyName']);
    })

    it('Should allow sort signs if allowSortSigns=true', async () => {
      const resource = api.getCollection('customers');
      const x: any = resource.normalizeFieldNames(['+address.City', '-familyname'], true);
      expect(x).toBeDefined();
      expect(x).toStrictEqual(['+address.city', '-familyName']);
    })
  })

  describe('normalizeFieldNames()', function () {

    it('Should return normalized field names', async () => {
      const resource = api.getCollection('customers');
      const x: any = resource.normalizeSortFields(['address.City', '-familyname']);
      expect(x).toBeDefined();
      expect(x).toStrictEqual(['address.city', '-familyName']);
    })

    it('Should throw if field is not in sort fields list', async () => {
      const resource = api.getCollection('customers');
      expect(() => resource.normalizeSortFields('countryCode'))
          .toThrow('UNACCEPTED_SORT_FIELD');
    })
  });

  describe('normalizeFilter()', function () {

    it('Should parse string query with normalized field names', async () => {
      const resource = api.getCollection('customers');
      const x: any = resource.normalizeFilter('givenname="John"');
      expect(x).toBeDefined();
      expect(x).toBeInstanceOf(Object);
      expect(x.kind).toEqual('ComparisonExpression');
      expect(x.left.value).toEqual('givenName');
    })

    it('Should throw if field is not in sort fields list', async () => {
      const resource = api.getCollection('customers');
      expect(() => resource.normalizeFilter('countryCode="PL"'))
          .toThrow('UNACCEPTED_FILTER_FIELD');
    })

  });


});
