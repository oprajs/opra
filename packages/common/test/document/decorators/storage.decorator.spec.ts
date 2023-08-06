import 'reflect-metadata';
import { METADATA_KEY, Storage } from '@opra/common';

describe('@Storage() decorator', function () {

  it('Should define Storage resource metadata', async function () {
    const opts: Storage.DecoratorOptions = {description: 'xyz'};

    @Storage(opts)
    class MyFilesResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, MyFilesResource);
    expect(metadata).toStrictEqual({
      kind: 'Storage',
      name: 'MyFiles',
      ...opts
    });
  })

  it('Should define custom name', async function () {
    const opts: Storage.DecoratorOptions = {name: 'Uploads'};

    @Storage(opts)
    class MyFilesResource {
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, MyFilesResource);
    expect(metadata).toStrictEqual({
      kind: 'Storage',
      name: 'Uploads',
      ...opts
    });
  })

});
