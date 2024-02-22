import 'reflect-metadata';
import { ApiOperation, RESOURCE_METADATA } from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';


describe('ApiOperation.Entity.* decorators', function () {

  afterAll(() => global.gc && global.gc());


  /* ***************************************************** */
  describe('"Create" decorator', function () {

    it('Should define Create operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.Create(Customer, {
          description: 'operation description',
          inputMaxContentSize: 1000
        })
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          create: {
            kind: 'Operation',
            composition: 'Entity.Create',
            method: 'POST',
            type: Customer,
            description: 'operation description',
            inputMaxContentSize: 1000,
            useTypes: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"Delete" decorator', function () {

    it('Should define Delete operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.Delete(Customer, {description: 'operation description'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          delete: {
            kind: 'Operation',
            composition: 'Entity.Delete',
            method: 'DELETE',
            type: Customer,
            description: 'operation description',
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.Delete(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          delete: {
            kind: 'Operation',
            composition: 'Entity.Delete',
            method: 'DELETE',
            type: Customer,
            filters: [
              {field: '_id', operators: ['=', '!=']},
              {field: 'givenName', operators: ['=', '!=', 'like']},
            ],
            useTypes: [Customer]
          }
        }
      });
    })
  })


  /* ***************************************************** */
  describe('"FindMany" decorator', function () {
    it('Should define FindMany operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindMany(Customer, {description: 'operation description'})
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            composition: 'Entity.FindMany',
            method: 'GET',
            type: Customer,
            description: 'operation description',
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindMany(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            composition: 'Entity.FindMany',
            method: 'GET',
            type: Customer,
            filters: [
              {field: '_id', operators: ['=', '!=']},
              {field: 'givenName', operators: ['=', '!=', 'like']},
            ],
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should SortFields() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindMany(Customer)
            .SortFields('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            composition: 'Entity.FindMany',
            method: 'GET',
            type: Customer,
            sortFields: ['_id', 'givenName'],
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should DefaultSort() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindMany(Customer)
            .DefaultSort('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            composition: 'Entity.FindMany',
            method: 'GET',
            type: Customer,
            defaultSort: ['_id', 'givenName'],
            useTypes: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"FindOne" decorator', function () {
    it('Should define FindOne operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindOne(Customer, {description: 'operation description'})
        findOne() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findOne: {
            kind: 'Operation',
            composition: 'Entity.FindOne',
            method: 'GET',
            type: Customer,
            description: 'operation description',
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindOne(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        findOne() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findOne: {
            kind: 'Operation',
            composition: 'Entity.FindOne',
            method: 'GET',
            type: Customer,
            filters: [
              {field: '_id', operators: ['=', '!=']},
              {field: 'givenName', operators: ['=', '!=', 'like']},
            ],
            useTypes: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"UpdateMany" decorator', function () {
    it('Should define UpdateMany operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.UpdateMany(Customer, {
          description: 'operation description',
          inputMaxContentSize: 1000
        })
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateMany: {
            kind: 'Operation',
            composition: 'Entity.UpdateMany',
            method: 'PATCH',
            type: Customer,
            description: 'operation description',
            inputMaxContentSize: 1000,
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.UpdateMany(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateMany: {
            kind: 'Operation',
            composition: 'Entity.UpdateMany',
            method: 'PATCH',
            type: Customer,
            filters: [
              {field: '_id', operators: ['=', '!=']},
              {field: 'givenName', operators: ['=', '!=', 'like']},
            ],
            useTypes: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"UpdateOne" decorator', function () {
    it('Should define UpdateOne operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.UpdateOne(Customer, {
          description: 'operation description',
          inputMaxContentSize: 1000
        })
        updateOne() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateOne: {
            kind: 'Operation',
            composition: 'Entity.UpdateOne',
            method: 'PATCH',
            type: Customer,
            description: 'operation description',
            inputMaxContentSize: 1000,
            useTypes: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.UpdateOne(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        updateOne() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateOne: {
            kind: 'Operation',
            composition: 'Entity.UpdateOne',
            method: 'PATCH',
            type: Customer,
            filters: [
              {field: '_id', operators: ['=', '!=']},
              {field: 'givenName', operators: ['=', '!=', 'like']},
            ],
            useTypes: [Customer]
          }
        }
      });
    })

  })


});
