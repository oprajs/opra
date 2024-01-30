import 'reflect-metadata';
import { Collection, RESOURCE_METADATA, Singleton } from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('Singleton decorators', function () {

  afterAll(() => global.gc && global.gc());

  describe('@Singleton() decorator', function () {

    /* ***************************************************** */
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


  /* ***************************************************** */
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

    it('Should Parameter() define metadata value', async function () {
      class CustomersResource {
        @Collection.Action()
            .Parameter('message', String)
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {parameters: [{name: 'message', type: String}]}
      });
    })

  })


  /* ***************************************************** */
  describe('@Singleton.Create() decorator', function () {
    it('Should define Create operation metadata', async function () {
      class CountryResource {
        @Singleton.Create({description: 'operation'})
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {description: 'operation', options: {}}
      });
    })

    it('Should InputMaxContentSize() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .InputMaxContentSize(1000)
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {options: {inputMaxContentSize: 1000}}
      });
    })

    it('Should InputPickFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .InputPickFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {options: {inputPickFields: ['_id', 'givenName']}}
      });
    })

    it('Should InputOverwriteFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .InputOverwriteFields({
              extraField: {type: 'string'}
            })
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {
          options: {
            inputOverwriteFields: {
              extraField: {type: 'string'}
            }
          }
        }
      });
    })

    it('Should InputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .InputOmitFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {options: {inputOmitFields: ['_id', 'givenName']}}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .OutputPickFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {options: {outputPickFields: ['_id', 'givenName']}}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Create()
            .OutputOmitFields('_id', 'givenName')
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        create: {options: {outputOmitFields: ['_id', 'givenName']}}
      });
    })

  })


  /* ***************************************************** */
  describe('@Singleton.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Singleton.Delete({description: 'operation'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        delete: {description: 'operation', options: {}}
      });
    })
  })


  /* ***************************************************** */
  describe('@Singleton.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Singleton.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation', options: {}}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Get()
            .OutputPickFields('_id', 'givenName')
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {options: {outputPickFields: ['_id', 'givenName']}}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Get()
            .OutputOmitFields('_id', 'givenName')
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {options: {outputOmitFields: ['_id', 'givenName']}}
      });
    })

  })


  /* ***************************************************** */
  describe('@Singleton.Update() decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CountryResource {
        @Singleton.Update({description: 'operation'})
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {description: 'operation', options: {}}
      });
    })

    it('Should InputMaxContentSize() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .InputMaxContentSize(1000)
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {options: {inputMaxContentSize: 1000}}
      });
    })

    it('Should InputPickFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .InputPickFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {options: {inputPickFields: ['_id', 'givenName']}}
      });
    })

    it('Should InputOverwriteFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .InputOverwriteFields({
              extraField: {type: 'string'}
            })
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {
          options: {
            inputOverwriteFields: {
              extraField: {type: 'string'}
            }
          }
        }
      });
    })

    it('Should InputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .InputOmitFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {options: {inputOmitFields: ['_id', 'givenName']}}
      });
    })

    it('Should OutputPickFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .OutputPickFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {options: {outputPickFields: ['_id', 'givenName']}}
      });
    })

    it('Should OutputOmitFields() define metadata value', async function () {
      class CountryResource {
        @Singleton.Update()
            .OutputOmitFields('_id', 'givenName')
        update() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        update: {options: {outputOmitFields: ['_id', 'givenName']}}
      });
    })

  })

});
