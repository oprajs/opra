import 'reflect-metadata';
import {
  EntityResource,
  OpraService, Resource,
  SchemaGenerator,
} from '../src';
import { Customer } from './_support/dto/customer.dto';
import { customersResource } from './_support/test-app/customers.resource';
import { CustomerAddressesResource } from './_support/test-app/customer-addresses.resource';

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
        types: [Customer],
        resources: [customersResource]
      };
      const service = await OpraService.create(args);
      expect(service.getResource('Customer')).toBeDefined();
      const resource = service.getResource('customer');
      expect(resource).toBeDefined();
      expect(resource.name).toStrictEqual('Customer');
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
      expect(service.getResource('CustomerAddress')).toBeDefined();
      const resource = service.getEntityResource('customeraddress');
      expect(resource).toBeDefined();
      expect(resource).toBeInstanceOf(EntityResource);
      expect(resource.name).toStrictEqual('CustomerAddress');
      expect(resource.primaryKey).toStrictEqual('id');
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
      expect(service.getResource('CustomerAddress')).toBeInstanceOf(Resource);
      expect(service.getResource('customeraddress')).toBeInstanceOf(Resource);
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
      expect(()=>service.getResource('notexistsresource')).toThrow('does not exists');
    })

  })


});
