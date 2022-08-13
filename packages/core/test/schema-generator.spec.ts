import 'reflect-metadata';
import { SchemaGenerator } from '../src';
import { Address } from './_support/dto/address.dto';
import { Customer } from './_support/dto/customer.dto';
import { customersResource } from './_support/test-app/customers.resource';
import { CustomerAddressesResource } from './_support/test-app/customer-addresses.resource';

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
      expect(schema.types[0]).toBeDefined();
      expect(schema.types[0].name).toStrictEqual('Address');
      expect(schema.types[1]).toBeDefined();
      expect(schema.types[1].name).toStrictEqual('Customer');
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
      expect(schema.types[0]).toBeDefined();
      expect(schema.types[0].name).toStrictEqual('Address');
      expect(schema.types[1]).toBeDefined();
      expect(schema.types[1].name).toStrictEqual('Customer');
    })

    it('Should generate resource schemas', async () => {
      const input: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        types: [Customer, Address],
        resources: [customersResource, new CustomerAddressesResource()]
      };
      const schema = await SchemaGenerator.generateServiceSchema(input);
      expect(schema.resources[0]).toBeDefined();
      expect(schema.resources[0].name).toStrictEqual('Customer');
      expect(schema.resources[1]).toBeDefined();
      expect(schema.resources[1].name).toStrictEqual('CustomerAddress');
    })

  });


});
