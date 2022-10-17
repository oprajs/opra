import { OpraDocument } from '../../src/implementation/opra-document.js';
import { ComplexType, SchemaGenerator } from '../../src/index.js';
import {
  Country,
  Customer,
  CustomerNotes,
} from '../_support/app-sqb/index.js';

describe('OpraDocument', function () {

  describe('static create()', function () {
    const args: SchemaGenerator.GenerateDocumentArgs = {
      info: {
        title: 'TestLib',
        version: 'v1',
      },
      types: [Customer, CustomerNotes, Country],
    };

    it('Should create OpraDocument instance', async () => {
      const doc = await OpraDocument.create(args);
      expect(doc).toBeInstanceOf(OpraDocument);
      expect(doc.info).toStrictEqual(args.info);
    })

    it('Should add data types', async () => {
      const doc = await OpraDocument.create(args);
      expect(doc.getDataType('Customer')).toBeDefined();
      const customerType = doc.getDataType('customer');
      expect(customerType).toBeDefined();
      expect(customerType.kind).toStrictEqual('ComplexType');
      expect(customerType.name).toStrictEqual('Customer');
    })

    it('Should add dependent data types', async () => {
      const doc = await OpraDocument.create(args);
      expect(() => doc.getDataType('record')).not.toThrow();
      const t = doc.getDataType('record');
      expect(t.kind).toStrictEqual('ComplexType');
      expect(t.name).toStrictEqual('Record');
    })

    it('Should determine data type from SQB Link', async () => {
      const doc = await OpraDocument.create(args);
      expect(() => doc.getDataType('continent')).not.toThrow();
      let t = doc.getComplexDataType('continent');
      expect(t.kind).toStrictEqual('ComplexType');
      expect(t.name).toStrictEqual('Continent');
      let f = t.getField('countries');
      expect(f.type).toStrictEqual('Country');
      expect(f.isArray).toStrictEqual(true);
      t = doc.getComplexDataType('Country');
      expect(t.kind).toStrictEqual('ComplexType');
      expect(t.name).toStrictEqual('Country');
      f = t.getField('continent');
      expect(f.type).toStrictEqual('Continent');
      expect(f.isArray).toStrictEqual(undefined);
    })

    it('Should determine type info from SQB field', async () => {
      const doc = await OpraDocument.create(args);
      const t = doc.getComplexDataType('Customer');
      let f = t.getField('fieldInteger');
      expect(f.type).toStrictEqual('integer');
      f = t.getField('fieldBigint');
      expect(f.type).toStrictEqual('bigint');
      f = t.getField('fieldGuid');
      expect(f.type).toStrictEqual('guid');
      f = t.getField('cid');
      expect(f.required).toStrictEqual(true);
      f = t.getField('identity');
      expect(f.required).toStrictEqual(false);
      f = t.getField('active');
      expect(f.default).toStrictEqual(true);
      f = t.getField('notes');
      expect(f.exclusive).toStrictEqual(true);
      f = t.getField('address');
      expect(f.exclusive).toStrictEqual(true);
      f = t.getField('vip');
      expect(f.exclusive).toStrictEqual(true);
    })

  })

  describe('OpraDocument instance', function () {

    it('Should getDataType() make a case insensitive lookup', async () => {
      const schema: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestLib',
          version: 'v1',
        },
        types: [Customer, CustomerNotes]
      };
      const doc = await OpraDocument.create(schema);
      expect(doc.getDataType('Customer')).toBeInstanceOf(ComplexType);
      expect(doc.getDataType('customer')).toBeInstanceOf(ComplexType);
    })

    it('Should getDataType() throw error if data type does not exists', async () => {
      const args: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestLib',
          version: 'v1',
        },
        types: [Customer, CustomerNotes]
      };
      const doc = await OpraDocument.create(args);
      expect(() => doc.getDataType('notexistsresource')).toThrow('does not exists');
    })

  })

});
