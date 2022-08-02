import 'reflect-metadata';
import {
  EntityResource,
  OpraService,
  SchemaGenerator,
} from '../src';
import { Customer } from './_support/dto/customer.dto';
import { customerResource } from './_support/test-app/customer.resource';
import { CustomerAddressResource } from './_support/test-app/customer-address.resource';

describe('OpraService', function () {

  it('Should create OpraService instance', async () => {
    const args: SchemaGenerator.GenerateServiceArgs = {
      info: {
        title: 'TestApi',
        version: 'v1',
        description: 'Test api description'
      },
      types: [],
      resources: []
    };
    const service = await OpraService.create(args);

    expect(service).toBeInstanceOf(OpraService);
    expect(service.info).toStrictEqual(args.info);
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
      resources: [customerResource]
    };
    const service = await OpraService.create(args);
    expect(service.getResource('Customer')).toBeDefined();
    const resource = service.getResource('customer');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('Customer');
  })

  it('Should decorated class instance', async () => {
    const doc: SchemaGenerator.GenerateServiceArgs = {
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [new CustomerAddressResource()]
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
      resources: [new CustomerAddressResource()]
    };
    const service = await OpraService.create(doc);
    expect(service.getDataType('Address')).toBeDefined();
  })

});
