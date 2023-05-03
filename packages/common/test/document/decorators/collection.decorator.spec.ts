import 'reflect-metadata';
import { Collection, METADATA_KEY } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('@Collection() decorator', function () {

  it('Should define Collection resource metadata', async function () {
    const opts: Collection.DecoratorOptions = {primaryKey: 'id', description: 'xyz'};

    @Collection(Country, opts)
    class CountryResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, CountryResource);
    expect(metadata).toStrictEqual({
      kind: 'Collection',
      name: 'Country',
      type: Country,
      ...opts
    });
  })

  it('Should define custom name', async function () {
    const opts: Collection.DecoratorOptions = {name: 'Countries'};

    @Collection(Country, opts)
    class CountryResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, CountryResource);
    expect(metadata).toStrictEqual({
      kind: 'Collection',
      name: 'Countries',
      type: Country,
      ...opts
    });
  })

});
