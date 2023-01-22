import { CollectionDeleteQuery, OpraDocument } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/test-app/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/test-app/resources/customers.resource.js';

describe('CollectionDeleteQuery', function () {
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
    const query = new CollectionDeleteQuery(resource, 1);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('delete');
    expect(query.operation).toStrictEqual('delete');
    expect(query.dataType).toBe(api.getDataType('Customer'));
    expect(query.keyValue).toStrictEqual(1);
  })

});
