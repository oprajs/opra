import 'reflect-metadata';
import {
  OprSingletonResource,
  RESOURCE_METADATA, SingletonResourceOptions
} from '../../src/index.js';
import { Customer } from '../_support/app-sqb/index.js';

describe('@OprSingletonResource() decorator', function () {

  it('Should define SingletonResource metadata', async function () {
    const opts: SingletonResourceOptions = {description: 'description'};

    @OprSingletonResource(Customer, opts)
    class BestCustomerResource {
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, BestCustomerResource);
    expect(metadata).toStrictEqual({
      kind: 'SingletonResource',
      name: 'BestCustomer',
      type: Customer,
      ...opts
    });
  })

});
