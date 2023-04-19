import 'reflect-metadata';
import { METADATA_KEY, Singleton } from '@opra/common';
import { Country } from '../../_support/test-doc/index.js';

describe('@Singleton() decorator', function () {

  it('Should define Singleton resource metadata', async function () {
    const opts: Singleton.DecoratorOptions = {description: 'xyz'};

    @Singleton(Country, opts)
    class MyCountryResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, MyCountryResource);
    expect(metadata).toStrictEqual({
      kind: 'Singleton',
      name: 'MyCountry',
      type: Country,
      ...opts
    });
  })

  it('Should define custom name', async function () {
    const opts: Singleton.DecoratorOptions = {name: 'MySweetCountry'};

    @Singleton(Country, opts)
    class MyCountry {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, MyCountry);
    expect(metadata).toStrictEqual({
      kind: 'Singleton',
      name: 'MySweetCountry',
      type: Country,
      ...opts
    });
  })

});
