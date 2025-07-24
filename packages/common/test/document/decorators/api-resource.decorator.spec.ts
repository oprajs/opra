import { HTTP_CONTROLLER_METADATA, HttpController } from '@opra/common';
import { expect } from 'expect';

describe('common:HttpResource decorator', () => {
  /* ***************************************************** */
  it('Should define Collection resource metadata', async () => {
    const opts: HttpController.Options = {
      name: 'Countries',
      description: 'Countries resource',
      path: '/Countries@:id',
    };

    @HttpController(opts)
    class CountriesController {}

    const metadata = Reflect.getMetadata(
      HTTP_CONTROLLER_METADATA,
      CountriesController,
    );
    expect(metadata).toStrictEqual({
      kind: 'HttpController',
      name: 'Countries',
      ...opts,
    });
  });

  it('Should set resource name from class name', async () => {
    @HttpController()
    class CountryController {}

    const metadata = Reflect.getMetadata(
      HTTP_CONTROLLER_METADATA,
      CountryController,
    );
    expect(metadata).toStrictEqual({
      kind: 'HttpController',
      name: 'Country',
      path: 'Country',
    });
  });
});
