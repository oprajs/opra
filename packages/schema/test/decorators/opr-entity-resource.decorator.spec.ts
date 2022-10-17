import 'reflect-metadata';
import { CollectionResourceOptions, OprCollectionResource, RESOURCE_METADATA } from '../../src/index.js';

describe('@OprCollectionResource() decorator', function () {

  it('Should define entity resource metadata', async function () {
    const opts: CollectionResourceOptions = {keyFields: 'id'};

    @OprCollectionResource(AnimalResource, opts)
    class AnimalResource {
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, AnimalResource);
    expect(metadata).toStrictEqual({
      kind: 'CollectionResource',
      name: 'Animal',
      type: AnimalResource,
      ...opts
    });
  })

});
