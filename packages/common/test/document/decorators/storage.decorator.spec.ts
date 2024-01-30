import 'reflect-metadata';
import { Collection, RESOURCE_METADATA, Storage } from '@opra/common';

describe('Storage decorators', function () {

  afterAll(() => global.gc && global.gc());

  /* ***************************************************** */
  describe('@Storage() decorator', function () {

    it('Should define Storage resource metadata', async function () {
      const opts: Storage.DecoratorOptions = {description: 'xyz'};

      @Storage(opts)
      class MyFilesResource {
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, MyFilesResource);
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

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, MyFilesResource);
      expect(metadata).toStrictEqual({
        kind: 'Storage',
        name: 'Uploads',
        ...opts
      });
    })
  })


  /* ***************************************************** */
  describe('@Storage.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class CountryResource {
        @Storage.Action({description: 'action'})
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
        sendMessage: {
          parameters: [{name: 'message', type: String}]
        }
      });
    })
  })


  /* ***************************************************** */
  describe('@Storage.Delete() decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CountryResource {
        @Storage.Delete({description: 'operation'})
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
  describe('@Storage.Get() decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CountryResource {
        @Storage.Get({description: 'operation'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        get: {description: 'operation', options: {}}
      });
    })
  })


  /* ***************************************************** */
  describe('@Storage.Post() decorator', function () {
    it('Should define Post operation metadata', async function () {
      class CountryResource {
        @Storage.Post({description: 'operation'})
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {description: 'operation', options: {}}
      });
    })

    it('Should MaxFields() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MaxFields(5)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {maxFields: 5}}
      });
    })

    it('Should MaxFieldSize() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MaxFieldSize(1000)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {maxFieldsSize: 1000}}
      });
    })

    it('Should MaxFiles() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MaxFiles(3)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {maxFiles: 3}}
      });
    })

    it('Should MaxFileSize() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MaxFileSize(1000)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {maxFileSize: 1000}}
      });
    })

    it('Should MaxTotalFileSize() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MaxTotalFileSize(1000)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {maxTotalFileSize: 1000}}
      });
    })


    it('Should MinFileSize() define metadata value', async function () {
      class CountryResource {
        @Storage.Post()
            .MinFileSize(1000)
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
      expect(metadata.operations).toStrictEqual({
        post: {options: {minFileSize: 1000}}
      });
    })


  })

});
