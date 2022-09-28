import { OpraDocument } from '../../src/implementation/opra-document.js';
import { ComplexType, SchemaGenerator } from '../../src/index.js';
import { Customer } from '../_support/entities/customer.entity.js';
import { CustomerAddress } from '../_support/entities/customer-address.entity.js';

describe('OpraDocument', function () {

  describe('static create()', function () {

    it('Should create OpraDocument instance', async () => {
      const args: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestLib',
          version: 'v1',
          description: 'Test lib description'
        },
        types: []
      };
      const doc = await OpraDocument.create(args);

      expect(doc).toBeInstanceOf(OpraDocument);
      expect(doc.info).toStrictEqual(args.info);
    })

    it('Should add data types', async () => {
      const args: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestLib',
          version: 'v1',
        },
        types: [Customer],
      };
      const doc = await OpraDocument.create(args);
      expect(doc.getDataType('Customer')).toBeDefined();
      const customerType = doc.getDataType('customer');
      expect(customerType).toBeDefined();
      expect(customerType.kind).toStrictEqual('EntityType');
      expect(customerType.name).toStrictEqual('Customer');
    })

  })

  describe('OpraDocument instance', function () {

    it('Should getDataType() make a case insensitive lookup', async () => {
      const schema: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestLib',
          version: 'v1',
        },
        types: [Customer, CustomerAddress]
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
        types: [Customer, CustomerAddress]
      };
      const doc = await OpraDocument.create(args);
      expect(() => doc.getDataType('notexistsresource')).toThrow('does not exists');
    })

  })

});
