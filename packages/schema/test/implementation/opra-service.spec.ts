import { EntityResource, OpraService, SchemaGenerator } from '../../src/index.js';
import { Customer } from '../_support/entities/customer.entity.js';
import { CustomerAddressesResource } from '../_support/resources/customer-addresses.resource.js';
import { CustomersResource } from '../_support/resources/customers.resource.js';

describe('OpraService', function () {

  describe('static create()', function () {

    it('Should create OpraService instance', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
          description: 'Test api description'
        },
        servers: [{
          url: 'http://localhost:8080',
          description: 'server1'
        }],
        types: [],
        resources: []
      };
      const service = await OpraService.create(args);

      expect(service).toBeInstanceOf(OpraService);
      expect(service.info).toStrictEqual(args.info);
      expect(service.servers).toStrictEqual(args.servers);
    })

    it('Should add data types', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        types: [Customer],
        resources: []
      };
      const service = await OpraService.create(args);
      expect(service.getDataType('Customer')).toBeDefined();
      const customerType = service.getDataType('customer');
      expect(customerType).toBeDefined();
      expect(customerType.kind).toStrictEqual('ComplexType');
      expect(customerType.name).toStrictEqual('Customer');
    })

    it('Should add resources by schema object', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        types: [],
        resources: [new CustomersResource()]
      };
      const service = await OpraService.create(args);
      expect(service.getResource('Customers')).toBeDefined();
      const resource = service.getResource('customers');
      expect(resource).toBeDefined();
      expect(resource.name).toStrictEqual('Customers');
    })

    it('Should add resources by decorated class instance', async () => {
      const doc: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerAddressesResource()]
      };
      const service = await OpraService.create(doc);
      expect(service.getResource('CustomerAddresses')).toBeDefined();
      const resource = service.getEntityResource('CustomerAddresses');
      expect(resource).toBeDefined();
      expect(resource).toBeInstanceOf(EntityResource);
      expect(resource.name).toStrictEqual('CustomerAddresses');
      expect(resource.description).toStrictEqual('Customer address resource');
    })

    it('Should automatically add data type while adding resource', async () => {
      const doc: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerAddressesResource()]
      };
      const service = await OpraService.create(doc);
      expect(service.getDataType('Address')).toBeDefined();
    })
  })

  describe('OpraService instance', function () {

    it('Should getResource() make a case insensitive lookup', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerAddressesResource()]
      };
      const service = await OpraService.create(args);
      expect(service.getResource('CustomerAddresses')).toBeInstanceOf(EntityResource);
      expect(service.getResource('CustomerAddresses')).toBeInstanceOf(EntityResource);
    })

    it('Should getResource() throw error if resource does not exists', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerAddressesResource()]
      };
      const service = await OpraService.create(args);
      expect(() => service.getResource('notexistsresource')).toThrow('does not exists');
    })

  })


});
