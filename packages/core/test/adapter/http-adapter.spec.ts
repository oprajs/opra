import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery, CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  OpraDocument, SingletonGetQuery
} from '@opra/common';
import { HttpExecutionContextHost } from '../../src/adapter/classes/http-execution-context.host.js';
import { OpraHttpAdapter, SingleRequestContext } from '../../src/index.js';
import { BestCustomerResource } from '../_support/test-app/resource/best-customer.resource.js';
import { CustomerNotesResource } from '../_support/test-app/resource/customer-notes.resource.js';
import { CustomersResource } from '../_support/test-app/resource/customers.resource.js';
import { createRequestWrapper } from '../_support/utils/create-request-wrapper.js';
import { createResponseWrapper } from '../_support/utils/create-response-wrapper.js';

describe('OpraHttpAdapter', function () {

  let document: OpraDocument;
  let adapter: OpraHttpAdapter;

  beforeAll(async () => {
    document = await OpraDocument.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [CustomersResource, CustomerNotesResource, BestCustomerResource]
    });
    adapter = new OpraHttpAdapter(document);
  });

  describe('parse request', function () {

    it('Should parse "CollectionGetQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'GET',
            url: 'http://testuri.org/Customers@1?&$pick=id&$omit=gender&$include=address'
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionGetQuery;
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionGetQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('get');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should parse "CollectionCreateQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'POST',
            url: '/Customers',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionCreateQuery;
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionCreateQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('create');
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should parse "CollectionUpdateQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'PATCH',
            url: '/Customers@1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionUpdateQuery;
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionUpdateQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('update');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should parse "CollectionUpdateManyQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'PATCH',
            url: '/Customers',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionUpdateManyQuery;
      expect(query).toBeDefined();
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionUpdateManyQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('updateMany');
      expect(query.filter).toBeDefined();
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should parse "CollectionDeleteQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'DELETE',
            url: '/Customers@1'
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionDeleteQuery;
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionDeleteQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('delete');
      expect(query.keyValue).toStrictEqual(1);
    })

    it('Should parse "CollectionDeleteManyQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'DELETE',
            url: '/Customers?$filter=id<10'
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionDeleteManyQuery;
      const resource = document.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionDeleteManyQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('deleteMany');
      expect(query.filter).toBeDefined()
    })

    it('Should parse "CollectionSearchQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'GET',
            url: '/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=id' +
                '&$pick=id&$omit=gender&$include=address'
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as CollectionSearchQuery;
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('CollectionSearchQuery');
      expect(query.resource.name).toStrictEqual('Customers');
      expect(query.method).toStrictEqual('search');
      expect(query.limit).toStrictEqual(1);
      expect(query.skip).toStrictEqual(1);
      expect(query.count).toStrictEqual(false);
      expect(query.distinct).toStrictEqual(true);
      expect(query.sort).toStrictEqual(['id']);
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should parse "SingletonGetQuery" query', async () => {
      const executionContext = new HttpExecutionContextHost('test',
          createRequestWrapper({
            method: 'GET',
            url: '/BestCustomer?&$pick=id&$omit=gender&$include=address'
          }),
          createResponseWrapper({})
      )
      const requestContext = await adapter.parse(executionContext) as SingleRequestContext;
      expect(requestContext).toBeDefined();
      expect(requestContext).toBeInstanceOf(SingleRequestContext);
      const query = requestContext.query as SingletonGetQuery;
      const resource = document.getSingletonResource('BestCustomer');
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('SingletonGetQuery');
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('get');
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })

    // todo
//     it('Should parse batch query', async () => {
//       const customer = {"id": 3001, "givenName": "Batch", "familyName": "Test", "gender": "M"};
//       const customerStr = JSON.stringify(customer);
//       const body = `--batch_1
// Content-Type: application/http
// Content-Transfer-Encoding: binary
// Content-ID: q1
//
// POST /Customers?$pick=id HTTP/1.1
// Content-Length: ${customerStr.length}
// Content-Type: application/json
// Accept: application/json
//
// ${customerStr}
//
// --batch_1
// Content-Type: application/http
// Content-Transfer-Encoding: binary
// Content-ID: q2
//
// GET /Customers@2?$pick=id HTTP/1.1
// Accept:application/json
//
// --batch_1--
// `.replaceAll('\n', '\r\n')
//       const bodyStream = Readable.from([body]);
//       const executionContext = new HttpExecutionContextHost('test',
//           createRequestWrapper({
//             method: 'GET',
//             url: '/$batch',
//             headers: {'content-type': 'multipart/mixed;boundary=batch_1'},
//             bodyStream,
//           }),
//           createResponseWrapper({})
//       )
//       const batch = await adapter.parse(executionContext);
//       expect(batch).toBeDefined();
//       expect(batch.queries.length).toStrictEqual(2);
//       let query;
//       query = batch.queries[0].query as CollectionCreateQuery;
//       let resource = document.getCollectionResource('Customers');
//       expect(query).toBeDefined();
//       expect(query.kind).toStrictEqual('CollectionCreateQuery');
//       expect(query.resource).toStrictEqual(resource);
//       expect(query.method).toStrictEqual('create');
//       expect(query.data).toStrictEqual(customer);
//       expect(query.pick).toStrictEqual(['id']);
//       query = batch.queries[1].query as CollectionGetQuery;
//       resource = document.getCollectionResource('Customers');
//       expect(query).toBeDefined();
//       expect(query.kind).toStrictEqual('CollectionGetQuery');
//       expect(query.resource).toStrictEqual(resource);
//       expect(query.method).toStrictEqual('get');
//       expect(query.keyValue).toStrictEqual(2);
//       expect(query.pick).toStrictEqual(['id']);
//     })

  });
});

