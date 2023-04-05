import 'reflect-metadata';
import { METADATA_KEY, Singleton } from '@opra/common';
import { Customer } from '../../_support/test-doc/index.js';

describe('@Singleton() decorator', function () {

  it('Should define Singleton resource metadata', async function () {
    const opts: Singleton.DecoratorOptions = {description: 'xyz'};

    @Singleton(Customer, opts)
    class StarredCustomerResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, StarredCustomerResource);
    expect(metadata).toStrictEqual({
      kind: 'Singleton',
      name: 'StarredCustomer',
      type: Customer,
      ...opts
    });
  })

  it('Should define custom name', async function () {
    const opts: Singleton.DecoratorOptions = {name: 'Starred'};

    @Singleton(Customer, opts)
    class StarredCustomerResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, StarredCustomerResource);
    expect(metadata).toStrictEqual({
      kind: 'Singleton',
      name: 'Starred',
      type: Customer,
      ...opts
    });
  })

});
