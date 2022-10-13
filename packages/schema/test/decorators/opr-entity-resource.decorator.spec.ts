import 'reflect-metadata';
import { EntityResourceOptions, OprEntityResource, RESOURCE_METADATA } from '../../src/index.js';

describe('@OprEntityResource() decorator', function () {

  it('Should define entity resource metadata', async function () {
    const opts: EntityResourceOptions = {keyFields: 'id'};

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
