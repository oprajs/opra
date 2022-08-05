import 'reflect-metadata';
import assert from 'node:assert';
import { ExecutionQuery, OpraService } from '../../src';
import { generateProjection } from '../../src/implementation/adapter/utils/generate-projection';
import { stringPathToObjectTree } from '../../src/implementation/adapter/utils/string-path-to-object-tree.js';
import { Address } from '../_support/dto/address.dto';
import { Customer } from '../_support/dto/customer.dto';
import { customerResource } from '../_support/test-app/customer.resource';
import { CustomerAddressResource } from '../_support/test-app/customer-address.resource';

describe('Adapter utils', function () {

  describe('stringPathToObjectTree()', function () {

    it('Should wrap array of string paths to object tree', async () => {
      const out = stringPathToObjectTree(['a', 'b', 'c.a.x', 'c.b']);
      expect(out).toStrictEqual({a: true, b: true, c: {a: {x: true}, b: true}});
    })

    it('Should ignore sub paths if whole path required', async () => {
      const out = stringPathToObjectTree(['a.x', 'a', 'a.y', 'b', 'b.x']);
      expect(out).toStrictEqual({a: true, b: true});
    })

  })

  describe('generateProjection()', function () {

    let service: OpraService;

    function createQuery(): ExecutionQuery {
      const resource = service.getEntityResource('Customer');
      return new ExecutionQuery({
        service,
        resource,
        operation: 'read',
        collection: false,
        resultType: resource.dataType,
        path: '',
        fullPath: ''
      });
    }

    beforeAll(async () => {
      service = await OpraService.create({
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        types: [Customer, Address],
        resources: [customerResource, new CustomerAddressResource()]
      });

    });

    it('Should return all properties if "elements" and "include" parameters are not given', async () => {
      const query = createQuery();
      generateProjection(query);
      expect(query.projection).toBeDefined();
      expect(query.projection?.id).toStrictEqual(true);
      expect(query.projection?.givenName).toStrictEqual(true);
      expect(query.projection?.gender).toStrictEqual(true);
    })

    it('Should not return exclusive properties unless requested.', async () => {
      let query = createQuery();
      generateProjection(query);
      expect(query.projection).toBeDefined();
      expect(query.projection?.address).toStrictEqual(undefined);
      query = createQuery();
      generateProjection(query, ['address']);
      expect(query.projection).toBeDefined();
      expect(query.projection?.id).toStrictEqual(undefined);
      expect(query.projection?.address).toBeInstanceOf(ExecutionQuery);
      query = createQuery();
      generateProjection(query, undefined, undefined, ['address']);
      expect(query.projection).toBeDefined();
      expect(query.projection?.id).toStrictEqual(true);
      expect(query.projection?.address).toBeInstanceOf(ExecutionQuery);
    })

    it('Should set only given properties in "elements" argument', async () => {
      const query = createQuery();
      generateProjection(query, ['id', 'gender']);
      expect(query.projection).toBeDefined();
      expect(query.projection?.id).toStrictEqual(true);
      expect(query.projection?.givenName).toStrictEqual(undefined);
      expect(query.projection?.gender).toStrictEqual(true);
      expect(query.projection?.address).toStrictEqual(undefined);
    })

    it('Should exclude given properties in "exclude" argument', async () => {
      const query = createQuery();
      generateProjection(query, undefined, ['id', 'gender']);
      expect(query.projection).toBeDefined();
      expect(query.projection?.id).toStrictEqual(undefined);
      expect(query.projection?.givenName).toStrictEqual(true);
      expect(query.projection?.gender).toStrictEqual(undefined);
    })

    it('Should create sub query for ComplexType properties', async () => {
      const query = createQuery();
      generateProjection(query, ['address.city', 'address.country']);
      expect(query.projection).toBeDefined();
      expect(query.projection?.address).toBeInstanceOf(ExecutionQuery);
      const addressQuery = (query.projection?.address as ExecutionQuery);
      expect(addressQuery.projection).toBeDefined();
      assert(addressQuery.projection);
      expect(Object.keys(addressQuery.projection)).toStrictEqual(['city', 'country']);
      expect(addressQuery.projection.city).toStrictEqual(true);
      expect(addressQuery.projection.country).toBeInstanceOf(ExecutionQuery);
    })

    it('Should throw if property does not exists in model', async () => {
      const query = createQuery();
      expect(() => generateProjection(query, ['address.xyz'])).toThrow('has no property');
    })

  });

});
