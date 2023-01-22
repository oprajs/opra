import { CollectionDeleteManyQuery, OpraDocument, parseFilter } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/test-app/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/test-app/resources/customers.resource.js';

describe('CollectionDeleteManyQuery', function () {
  let api: OpraDocument;

  beforeAll(async () => {
    api = await OpraDocument.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new CustomersResource(), new CustomerNotesResource()]
    });
  });

  it('Should create query', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionDeleteManyQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('deleteMany');
    expect(query.operation).toStrictEqual('delete');
    expect(query.dataType).toBe(api.getDataType('Customer'));
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionDeleteManyQuery(resource, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionDeleteManyQuery(resource, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })


});
