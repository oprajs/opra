import 'reflect-metadata';
import { HTTP_CONTROLLER_METADATA, HttpController } from '@opra/common';

describe('HttpResource decorator', function () {
  afterAll(() => global.gc && global.gc());

  /* ***************************************************** */
  it('Should define Collection resource metadata', async function () {
    const opts: HttpController.Options = {
      name: 'Countries',
      description: 'Countries resource',
      path: '/Countries@:id',
    };

    @HttpController(opts)
    class CountryResource {}

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CountryResource);
    expect(metadata).toStrictEqual({
      kind: 'HttpController',
      name: 'Countries',
      ...opts,
    });
  });

  it('Should set resource name from class name', async function () {
    @HttpController()
    class CountryResource {}

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CountryResource);
    expect(metadata).toStrictEqual({
      kind: 'HttpController',
      name: 'Country',
      path: 'Country',
    });
  });
});
