import 'reflect-metadata';
import { Singleton, RESOURCE_METADATA } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('Singleton decorators', function () {

  describe('@Singleton() decorator', function () {

    it('Should define Singleton resource metadata', async function () {
      const opts: Singleton.DecoratorOptions = {description: 'xyz'};

      @Singleton(Country, opts)
      class MyCountryResource {
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, MyCountryResource);
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

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, MyCountry);
      expect(metadata).toStrictEqual({
        kind: 'Singleton',
        name: 'MySweetCountry',
        type: Country,
        ...opts
      });
    })
  })

  describe('@Singleton.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class CountryResource {
        @Singleton.Action({description: 'action'})
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })
  })

  describe('@Singleton.Create() decorator', function () {
    it('Should define Create operation metadata', async function () {
      class CountryResource {
        @Singleton.Create({description: 'operation'})
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {description: 'operation'}
      });
    })
  })

  describe('@Singleton.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Singleton.Delete({description: 'operation'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        delete: {description: 'operation'}
      });
    })
  })

  describe('@Singleton.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Singleton.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation'}
      });
    })
  })

  describe('@Singleton.Update() decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CountryResource {
        @Singleton.Update({description: 'operation'})
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {description: 'operation'}
      });
    })
  })

});
