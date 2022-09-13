import 'reflect-metadata';
import { SchemaGenerator } from '../src/index.js';
import { CustomerAddressesesResource } from './_support/test-app/api/customer-addresseses.resource.js';
import { CustomersResource } from './_support/test-app/api/customers.resource.js';
import { Address } from './_support/test-app/dto/address.dto.js';
import { Customer } from './_support/test-app/dto/customer.dto.js';

describe('SchemaGenerator', function () {

  describe('generateDocumentSchema()', function () {

    it('Should generate Document schema', async () => {
      const input: SchemaGenerator.GenerateDocumentArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [],
      };
      const schema = await SchemaGenerator.generateDocumentSchema(input);

      expect(schema.info).toStrictEqual(schema.info);
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
      expect(schema.types.find(x => x.name === 'Address')).toBeDefined();
      expect(schema.types.find(x => x.name === 'Country')).toBeDefined();
      expect(schema.types.find(x => x.name === 'Customer')).toBeDefined();
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
        types: [Customer, Address],
        resources: []
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.types.length).toBeGreaterThan(0);
      expect(schema.types.find(x => x.name === 'Address')).toBeDefined();
      expect(schema.types.find(x => x.name === 'Country')).toBeDefined();
      expect(schema.types.find(x => x.name === 'Customer')).toBeDefined();
    })

    it('Should generate resource schemas', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [Customer, Address],
        resources: [new CustomersResource(), new CustomerAddressesesResource()]
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.types.length).toBeGreaterThan(0)
      expect(schema.resources.find(x => x.name === 'Customers')).toBeDefined();
      expect(schema.resources.find(x => x.name === 'CustomerAddresseses')).toBeDefined();
    })

  });


});
