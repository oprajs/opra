import 'reflect-metadata';
import { Collection, RESOURCE_METADATA } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';


describe('Collection decorators', function () {

  describe('@Collection() decorator', function () {

    /* ***************************************************** */
    it('Should define Collection resource metadata', async function () {
      const opts: Collection.DecoratorOptions = {primaryKey: 'id', description: 'xyz'};

      @Collection(Country, opts)
      class CountryResource {
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
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

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata).toStrictEqual({
        kind: 'Collection',
        name: 'Countries',
        type: Country,
        ...opts
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class CountryResource {
        @Collection.Action({description: 'action'})
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })
  })


  /* ***************************************************** */
  describe('@Collection.Create() decorator', function () {
    it('Should define Create operation metadata', async function () {
      class CountryResource {
        @Collection.Create({description: 'operation'})
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {description: 'operation'}
      });
    })

    it('Should InputMaxContentSize() define metadata value', async function () {
      class CountryResource {
        @Collection.Create()
            .InputMaxContentSize(1000)
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {inputMaxContentSize: 1000}
      });
    })

    it('Should InputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Create()
            .InputPickFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {inputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should InputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Create()
            .InputOmitFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {inputOmitFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Create()
            .OutputPickFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {outputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Create()
            .OutputOmitFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {outputOmitFields: ['_id', 'givenName']}
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Collection.Delete({description: 'operation'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        delete: {description: 'operation'}
      });
    })
  })


  /* ***************************************************** */
  describe('@Collection.DeleteMany() decorator', function () {
    it('Should define DeleteMany operation metadata', async function () {
      class CountryResource {
        @Collection.DeleteMany({description: 'operation'})
        deleteMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        deleteMany: {description: 'operation'}
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CountryResource {
        @Collection.DeleteMany()
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        deleteMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        deleteMany: {
          filters: [
            {field: '_id', operators: ['=', '!=']},
            {field: 'givenName', operators: ['=', '!=', 'like']},
          ]
        }
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Collection.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation'}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Get()
            .OutputPickFields('_id', 'givenName')
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {outputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Get()
            .OutputOmitFields('_id', 'givenName')
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {outputOmitFields: ['_id', 'givenName']}
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.FindMany() decorator', function () {
    it('Should define FindMany operation metadata', async function () {
      class CountryResource {
        @Collection.FindMany({description: 'operation'})
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {description: 'operation'}
      });
    })

    it('Should SortFields() define metadata value', async function () {
      class CountryResource {
        @Collection.FindMany()
            .SortFields('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {sortFields: ['_id', 'givenName']}
      });
    })

    it('Should DefaultSort() define metadata value', async function () {
      class CountryResource {
        @Collection.FindMany()
            .DefaultSort('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {defaultSort: ['_id', 'givenName']}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.FindMany()
            .OutputPickFields('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {outputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.FindMany()
            .OutputOmitFields('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        findMany: {outputOmitFields: ['_id', 'givenName']}
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.Update() decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CountryResource {
        @Collection.Update({description: 'operation'})
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {description: 'operation'}
      });
    })

    it('Should InputMaxContentSize() define metadata value', async function () {
      class CountryResource {
        @Collection.Update()
            .InputMaxContentSize(1000)
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {inputMaxContentSize: 1000}
      });
    })

    it('Should InputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Update()
            .InputPickFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {inputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should InputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Update()
            .InputOmitFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {inputOmitFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Update()
            .OutputPickFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {outputPickFields: ['_id', 'givenName']}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.Update()
            .OutputOmitFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {outputOmitFields: ['_id', 'givenName']}
      });
    })

  })


  /* ***************************************************** */
  describe('@Collection.UpdateMany() decorator', function () {
    it('Should define UpdateMany operation metadata', async function () {
      class CountryResource {
        @Collection.UpdateMany({description: 'operation'})
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {description: 'operation'}
      });
    })

    it('Should InputMaxContentSize() define metadata value', async function () {
      class CountryResource {
        @Collection.UpdateMany()
            .InputMaxContentSize(1000)
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {inputMaxContentSize: 1000}
      });
    })

    it('Should InputPickFields() define metadata value', async function () {
      class CountryResource {
        @Collection.UpdateMany()
            .InputPickFields('_id', 'givenName')
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {inputPickFields: ['_id', 'givenName']}
      });
    })


    it('Should InputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Collection.UpdateMany()
            .InputOmitFields('_id', 'givenName')
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {inputOmitFields: ['_id', 'givenName']}
      });
    })


    it('Should Filter() define metadata value', async function () {
      class CountryResource {
        @Collection.UpdateMany()
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        updateMany: {
          filters: [
            {field: '_id', operators: ['=', '!=']},
            {field: 'givenName', operators: ['=', '!=', 'like']},
          ]
        }
      });
    })


  })

});
