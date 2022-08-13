import 'reflect-metadata';
import assert from 'node:assert';
import { ExecutionQuery, OpraService } from '../../src';
import { Address } from '../_support/dto/address.dto';
import { Customer } from '../_support/dto/customer.dto';
import { customersResource } from '../_support/test-app/customers.resource';
import { CustomerAddressesResource } from '../_support/test-app/customer-addresses.resource';

describe('ExecutionQuery', function () {
  let service: OpraService;

  beforeAll(async () => {
    service = await OpraService.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [Customer, Address],
      resources: [customersResource, new CustomerAddressesResource()]
    });
  });

  describe('setProjection()', function () {

    it('Should return all properties if "elements" and "include" parameters are not given', async () => {
      const query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection();
      expect(query.projection.id).toStrictEqual(true);
      expect(query.projection.givenName).toStrictEqual(true);
      expect(query.projection.gender).toStrictEqual(true);
    })

    it('Should not return exclusive properties unless requested.', async () => {
      let query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection();
      expect(query.projection.address).toStrictEqual(undefined);
      query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection(['address']);
      expect(query.projection.id).toStrictEqual(undefined);
      expect(query.projection.address).toBeInstanceOf(ExecutionQuery);
      query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection(undefined, undefined, ['address']);
      expect(query.projection.id).toStrictEqual(true);
      expect(query.projection.address).toBeInstanceOf(ExecutionQuery);
    })

    it('Should set only given properties in "elements" argument', async () => {
      const query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection(['id', 'gender']);
      expect(query.projection.id).toStrictEqual(true);
      expect(query.projection.givenName).toStrictEqual(undefined);
      expect(query.projection.gender).toStrictEqual(true);
      expect(query.projection.address).toStrictEqual(undefined);
    })

    it('Should exclude given properties in "exclude" argument', async () => {
      const query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection(undefined, ['id', 'gender']);
      expect(query.projection.id).toStrictEqual(undefined);
      expect(query.projection.givenName).toStrictEqual(true);
      expect(query.projection.gender).toStrictEqual(undefined);
    })

    it('Should create sub query for ComplexType properties', async () => {
      const query = new ExecutionQuery(service, 'read', 'Customer');
      query.setProjection(['address.city', 'address.country']);
      expect(query.projection.address).toBeInstanceOf(ExecutionQuery);
      const addressQuery = (query.projection.address as ExecutionQuery);
      assert(addressQuery.projection);
      expect(Object.keys(addressQuery.projection)).toStrictEqual(['city', 'country']);
      expect(addressQuery.projection.city).toStrictEqual(true);
      expect(addressQuery.projection.country).toBeInstanceOf(ExecutionQuery);
    })

    it('Should throw if property does not exists in model', async () => {
      const query = new ExecutionQuery(service, 'read', 'Customer');
      expect(() => query.setProjection(['address.xyz'])).toThrow('has no property');
    })

  });

});
