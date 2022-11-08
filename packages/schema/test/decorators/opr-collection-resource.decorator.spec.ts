import 'reflect-metadata';
import { CollectionResourceOptions, OprCollectionResource, RESOURCE_METADATA } from '../../src/index.js';
import { Customer } from '../_support/app-sqb/index.js';

describe('@OprCollectionResource() decorator', function () {

  it('Should define CollectionResource metadata', async function () {
    const opts: CollectionResourceOptions = {keyFields: 'id'};

    @OprCollectionResource(Customer, opts)
    class StarredCustomersResource {
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, StarredCustomersResource);
    expect(metadata).toStrictEqual({
      kind: 'CollectionResource',
      name: 'StarredCustomers',
      type: Customer,
      ...opts
    });
  })

});
