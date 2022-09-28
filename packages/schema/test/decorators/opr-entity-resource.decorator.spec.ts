import 'reflect-metadata';
import { OprEntityOptions, OprEntityResource, RESOURCE_METADATA } from '../../src/index.js';

describe('@OprEntityResource() decorator', function () {

  it('Should define entity resource metadata', async function () {
    const opts: OprEntityOptions = {primaryKey: 'id'};

    @OprEntityResource(AnimalResource, opts)
    class AnimalResource {
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, AnimalResource);
    expect(metadata).toStrictEqual({
      kind: 'EntityResource',
      name: 'Animal',
      type: AnimalResource,
      ...opts
    });
  })

});
