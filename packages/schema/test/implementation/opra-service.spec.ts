import { EntityResource, OpraApi, SchemaGenerator } from '../../src/index.js';
import {
  Customer,
  CustomerNotesResource,
  CustomersResource
} from '../_support/app-sqb/index.js';

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
      const api = await OpraApi.create(args);
      expect(api).toBeInstanceOf(OpraApi);
      expect(api.info).toStrictEqual(args.info);
      expect(api.servers).toStrictEqual(args.servers);
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
      const api = await OpraApi.create(args);
      expect(api.getDataType('Customer')).toBeDefined();
      const customerType = api.getDataType('customer');
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
      const api = await OpraApi.create(args);
      expect(api.getResource('Customers')).toBeDefined();
      const resource = api.getResource('customers');
      expect(resource).toBeDefined();
      expect(resource.name).toStrictEqual('Customers');
    })

    it('Should add resources by decorated class instance', async () => {
      const doc: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerNotesResource()]
      };
      const api = await OpraApi.create(doc);
      expect(api.getResource('CustomerNotes')).toBeDefined();
      const resource = api.getEntityResource('CustomerNotes');
      expect(resource).toBeDefined();
      expect(resource).toBeInstanceOf(EntityResource);
      expect(resource.name).toStrictEqual('CustomerNotes');
      expect(resource.description).toStrictEqual('Customer notes resource');
    })

    it('Should automatically add data type while adding resource', async () => {
      const doc: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerNotesResource()]
      };
      const api = await OpraApi.create(doc);
      expect(api.getDataType('CustomerNotes')).toBeDefined();
    })
  })

  describe('OpraService instance', function () {

    it('Should getResource() make a case insensitive lookup', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerNotesResource()]
      };
      const api = await OpraApi.create(args);
      expect(api.getResource('CustomerNotes')).toBeInstanceOf(EntityResource);
      expect(api.getResource('CustomerNotes')).toBeInstanceOf(EntityResource);
    })

    it('Should getResource() throw error if resource does not exists', async () => {
      const args: SchemaGenerator.GenerateServiceArgs = {
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        resources: [new CustomerNotesResource()]
      };
      const api = await OpraApi.create(args);
      expect(() => api.getResource('notexistsresource')).toThrow('does not exists');
    })

  })


});
