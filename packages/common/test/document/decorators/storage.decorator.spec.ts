import 'reflect-metadata';
import { SOURCE_METADATA, Storage } from '@opra/common';

describe('Storage decorators', function () {

  describe('@Storage() decorator', function () {

    it('Should define Storage resource metadata', async function () {
      const opts: Storage.DecoratorOptions = {description: 'xyz'};

      @Storage(opts)
      class MyFilesResource {
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, MyFilesResource);
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

      const metadata = Reflect.getMetadata(SOURCE_METADATA, MyFilesResource);
      expect(metadata).toStrictEqual({
        kind: 'Storage',
        name: 'Uploads',
        ...opts
      });
    })
  })

  describe('@Storage.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class CountryResource {
        @Storage.Action({description: 'action'})
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })
  })

  describe('@Storage.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Storage.Delete({description: 'operation'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        delete: {description: 'operation'}
      });
    })
  })

  describe('@Storage.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Storage.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation'}
      });
    })
  })

  describe('@Storage.Post() decorator', function () {
    it('Should define Post operation metadata', async function () {
      class CountryResource {
        @Storage.Post({description: 'operation'})
        post() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {description: 'operation'}
      });
    })
  })

});
