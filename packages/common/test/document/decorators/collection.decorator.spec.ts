import 'reflect-metadata';
import { Collection, SOURCE_METADATA } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('Collection decorators', function () {

  describe('@Collection() decorator', function () {

    it('Should define Collection resource metadata', async function () {
      const opts: Collection.DecoratorOptions = {primaryKey: 'id', description: 'xyz'};

      @Collection(Country, opts)
      class CountryResource {
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
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

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata).toStrictEqual({
        kind: 'Collection',
        name: 'Countries',
        type: Country,
        ...opts
      });
    })

  })

  describe('@Collection.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class CountryResource {
        @Collection.Action({description: 'action'})
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })
  })

  describe('@Collection.Create() decorator', function () {
    it('Should define Create operation metadata', async function () {
      class CountryResource {
        @Collection.Create({description: 'operation'})
        create() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {description: 'operation'}
      });
    })
  })

  describe('@Collection.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Collection.Delete({description: 'operation'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        delete: {description: 'operation'}
      });
    })
  })

  describe('@Collection.DeleteMany() decorator', function () {
    it('Should define DeleteMany operation metadata', async function () {
      class CountryResource {
        @Collection.DeleteMany({description: 'operation'})
        deleteMany() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        deleteMany: {description: 'operation'}
      });
    })
  })

  describe('@Collection.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Collection.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation'}
      });
    })
  })

  describe('@Collection.FindMany() decorator', function () {
    it('Should define FindMany operation metadata', async function () {
      class CountryResource {
        @Collection.FindMany({description: 'operation'})
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {description: 'operation'}
      });
    })
  })

  describe('@Collection.Update() decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CountryResource {
        @Collection.Update({description: 'operation'})
        update() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {description: 'operation'}
      });
    })
  })

  describe('@Collection.UpdateMany() decorator', function () {
    it('Should define UpdateMany operation metadata', async function () {
      class CountryResource {
        @Collection.UpdateMany({description: 'operation'})
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(SOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {description: 'operation'}
      });
    })
  })


});
