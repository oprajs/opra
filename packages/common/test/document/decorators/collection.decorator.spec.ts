import 'reflect-metadata';
import { Collection, METADATA_KEY } from '@opra/common';
import { Customer } from '../../_support/test-doc/index.js';

describe('@Collection() decorator', function () {

  it('Should define Collection resource metadata', async function () {
    const opts: Collection.DecoratorOptions = {primaryKey: 'id', description: 'xyz'};

    @Collection(Customer, opts)
    class StarredCustomersResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, StarredCustomersResource);
    expect(metadata).toStrictEqual({
      kind: 'Collection',
      name: 'StarredCustomers',
      type: Customer,
      ...opts
    });
  })

  it('Should define custom name', async function () {
    const opts: Collection.DecoratorOptions = {name: 'Starred'};

    @Collection(Customer, opts)
    class StarredCustomersResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, StarredCustomersResource);
    expect(metadata).toStrictEqual({
      kind: 'Collection',
      name: 'Starred',
      type: Customer,
      ...opts
    });
  })

});
