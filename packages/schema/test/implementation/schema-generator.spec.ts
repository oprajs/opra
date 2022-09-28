import { SchemaGenerator } from '../../src/index.js';
import { Customer } from '../_support/entities/customer.entity.js';
import { CustomerAddress } from '../_support/entities/customer-address.entity.js';
import { CustomerAddressesResource } from '../_support/resources/customer-addresses.resource.js';
import { CustomersResource } from '../_support/resources/customers.resource.js';
import { Address } from '../_support/types/address.dto.js';

describe('SchemaGenerator', function () {

  describe('generateDocumentSchema()', function () {
    const info = {
      title: 'TestDocument',
      version: 'v1',
      description: 'Test api description'
    };

    it('Should generate Document schema', async () => {
      const input: SchemaGenerator.GenerateDocumentArgs = {
        info,
        types: [],
      };
      const schema = await SchemaGenerator.generateDocumentSchema(input);
      expect(schema.info).toStrictEqual(schema.info);
      expect(schema.types).toStrictEqual([]);
    })

    it('Should generate data type schemas', async () => {
      const input: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [Customer, Address]
      };
      const schema = await SchemaGenerator.generateDocumentSchema(input);
      expect(schema.types.length).toBeGreaterThan(0)
      expect(schema.types.map(x => x.name)).toStrictEqual(['Address', 'Country', 'Customer', 'Note', 'Person', 'Record']);
    })

  });

  describe('generateServiceSchema()', function () {

    it('Should generate Service schema', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [],
        resources: []
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);

      expect(schema.info).toStrictEqual(schema.info);
    })

    it('Should generate data type schemas', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [Customer, CustomerAddress],
        resources: []
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.types.length).toBeGreaterThan(0);
      expect(schema.types.map(x => x.name))
          .toStrictEqual(['Address', 'Country', 'Customer', 'CustomerAddress', 'Note', 'Person', 'Record']);
    })

    it('Should add data typed from resources', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [],
        resources: [new CustomersResource(), new CustomerAddressesResource()]
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.types.length).toBeGreaterThan(0);
      expect(schema.types.map(x => x.name))
          .toStrictEqual(['Address', 'Country', 'Customer', 'CustomerAddress', 'Note', 'Person', 'Record']);
    })

    it('Should generate resource schemas', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [Customer, Address],
        resources: [new CustomersResource(), new CustomerAddressesResource()]
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.types.length).toBeGreaterThan(0)
      expect(schema.resources.map(x => x.name)).toStrictEqual(['CustomerAddresses', 'Customers']);
    })

  });


});
