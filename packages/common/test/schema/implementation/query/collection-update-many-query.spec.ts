import { CollectionUpdateManyQuery, OpraDocument, parseFilter } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/app-sqb/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/app-sqb/resources/customers.resource.js';

describe('CollectionUpdateManyQuery', function () {
  let api: OpraDocument;
  const data = {givenName: 'john'};

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
    const query = new CollectionUpdateManyQuery(resource, data);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('updateMany');
    expect(query.operation).toStrictEqual('update');
    expect(query.dataType).toBe(api.getDataType('Customer'));
    expect(query.data).toStrictEqual(data);
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionUpdateManyQuery(resource, data, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionUpdateManyQuery(resource, data, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

});
