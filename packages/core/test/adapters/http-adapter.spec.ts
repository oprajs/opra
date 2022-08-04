import 'reflect-metadata';
import { OpraURL } from '@opra/url';
import { ExecutionQuery, OpraService } from '../../src';
import { OpraHttpAdapter } from '../../src/implementation/adapter/http-adapter';
import { Address } from '../_support/dto/address.dto';
import { Customer } from '../_support/dto/customer.dto';
import { customerResource } from '../_support/test-app/customer.resource';
import { CustomerAddressResource } from '../_support/test-app/customer-address.resource';

class TestHttpAdapter extends OpraHttpAdapter<any> {
  constructor(service: OpraService) {
    super(service);
  }

  buildQuery(url: OpraURL, method: string): {
    query: ExecutionQuery;
    returnPath: string;
  } {
    return super.buildQuery(url, method);
  }
}

describe('OpraHttpAdapter', function () {

  let service: OpraService;

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

  describe('buildQuery()', function () {

    describe('EntityResource', function () {

      it('Should generate "read" query for single Resource instance', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1');
        const result = adapter.buildQuery(url, 'GET');
        expect(result).toBeDefined();
        const {query} = result;
        const resource = service.getEntityResource('Customer');
        expect(query).toBeDefined();
        expect(query.service).toStrictEqual(service);
        expect(query.resource).toStrictEqual(resource);
        expect(query.operation).toStrictEqual('read');
        expect(query.collection).toStrictEqual(false);
        expect(query.path).toStrictEqual('');
        expect(query.fullPath).toStrictEqual('');
        expect(query.keyValues).toStrictEqual({id: '1'});
        expect(query.resultType).toStrictEqual(service.getDataType('Customer'));
      })

      it('Should generate "read" query for collection of Resources', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer');
        const result = adapter.buildQuery(url, 'GET');
        expect(result).toBeDefined();
        const {query} = result;
        const resource = service.getEntityResource('Customer');
        expect(query).toBeDefined();
        expect(query.service).toStrictEqual(service);
        expect(query.resource).toStrictEqual(resource);
        expect(query.operation).toStrictEqual('read');
        expect(query.collection).toStrictEqual(true);
        expect(query.path).toStrictEqual('');
        expect(query.fullPath).toStrictEqual('');
        expect(query.keyValues).toStrictEqual(undefined);
        expect(query.resultType).toStrictEqual(service.getDataType('Customer'));
      })

      it('Should build list of all properties to be exposed', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer');
        const {query} = adapter.buildQuery(url, 'GET');
        const customerType = service.getEntityResource('Customer').dataType;
        const elements = Object.keys(customerType.properties!).reduce((o, k) => {
          o[k] = true;
          return o;
        }, {});
        expect(query.projection).toStrictEqual(elements);
      })

      it('Should parse $elements parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$elements=givenName,gender,address.city,address.street');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.projection).toStrictEqual({
          id: false, gender: true, givenName: true,
          address: {city: true}
        });
      })

      it('Should validate properties while parsing $elements parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$elements=prm1,gender');
        expect(() => adapter.buildQuery(url, 'GET')).toThrow(`"Customer" entity does not have a property named "prm1"`);
      })

      it('Should parse $limit parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$limit=5');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.limit).toStrictEqual(5);
      })

      it('Should parse $skip parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$skip=5');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.skip).toStrictEqual(5);
      })

      it('Should parse $filter parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$filter=gender="M"');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.filter).toBeDefined();
      })

      it('Should parse $sort parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        let url = new OpraURL('/Customer@1?$sort=id');
        let r = adapter.buildQuery(url, 'GET');
        expect(r.query.sort).toStrictEqual(['id']);
        url = new OpraURL('/Customer@1?$sort=id,givenname');
        r = adapter.buildQuery(url, 'GET');
        expect(r.query.sort).toStrictEqual(['id', 'givenname']);
      })

      it('Should parse $distinct parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$distinct=false');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.distinct).toStrictEqual(false);
      })

      it('Should parse $total parameter', async () => {
        const adapter = new TestHttpAdapter(service);
        const url = new OpraURL('/Customer@1?$total=false');
        const {query} = adapter.buildQuery(url, 'GET');
        expect(query.total).toStrictEqual(false);
      })

    });

  })

});
