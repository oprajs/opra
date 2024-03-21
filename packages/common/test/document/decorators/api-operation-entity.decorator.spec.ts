import 'reflect-metadata';
import { HttpOperation, RESOURCE_METADATA } from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';


describe('HttpOperation.Entity.* decorators', function () {

  afterAll(() => global.gc && global.gc());


  /* ***************************************************** */
  describe('"Create" decorator', function () {

    const defaultParameters = [
      {
        description: "Determines fields to be exposed",
        in: "query",
        isArray: true,
        name: "fields",
        type: String
      }
    ];

    it('Should define Create operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Create(Customer, {
          description: 'operation description',
          input: {
            maxContentSize: 1000
          }
        })
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toEqual({
        endpoints: {
          create: {
            kind: 'Operation',
            method: 'POST',
            composition: 'Entity.Create',
            compositionOptions: {
              type: 'Customer'
            },
            description: 'operation description',
            requestBody: {
              content: [{
                contentType: "application/json",
                contentEncoding: "utf-8",
                type: Customer,
              }],
              maxContentSize: 1000,
              required: true
            },
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.instance+json",
                statusCode: '201',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"Delete" decorator', function () {

    it('Should define Delete operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Delete(Customer, 'id', {description: 'operation description'})
        delete() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          delete: {
            kind: 'Operation',
            method: 'DELETE',
            composition: 'Entity.Delete',
            compositionOptions: {
              type: 'Customer',
              keyField: 'id'
            },
            description: 'operation description',
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200',
              }
            ],
            types: [Customer]
          }
        }
      });
    })
  })


  /* ***************************************************** */
  describe('"DeleteMany" decorator', function () {

    it('Should define DeleteMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.DeleteMany(Customer, {description: 'operation description'})
        deleteMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          deleteMany: {
            kind: 'Operation',
            method: 'DELETE',
            composition: 'Entity.DeleteMany',
            compositionOptions: {
              type: 'Customer'
            },
            description: 'operation description',
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200',
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.DeleteMany(Customer)
            .Filter('_id', ['=', '!='])
            .Filter('givenName', ['=', '!=', 'like'])
        deleteMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          deleteMany: {
            kind: 'Operation',
            method: 'DELETE',
            composition: 'Entity.DeleteMany',
            compositionOptions: {
              type: 'Customer',
              filters: [
                {field: '_id', operators: ['=', '!=']},
                {field: 'givenName', operators: ['=', '!=', 'like']},
              ],
            },
            parameters: [
              {
                description: "Determines filter fields",
                in: "query",
                name: "filter",
                type: String
              }
            ],
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200',
              }
            ],
            types: [Customer]
          }
        }
      });
    })
  })

  /* ***************************************************** */
  describe('"FindMany" decorator', function () {

    const defaultParameters = [
      {
        description: "Determines number of returning instances",
        in: "query",
        name: "limit",
        type: Number
      },
      {
        description: "Determines number of instances to be skipped",
        in: "query",
        name: "skip",
        type: Number
      },
      {
        description: "Determines fields to be exposed",
        in: "query",
        isArray: true,
        name: "fields",
        type: String
      },
      {
        description: "Counts all matching instances if enabled",
        in: "query",
        name: "count",
        type: Boolean
      }
    ];

    it('Should define FindMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany(Customer, {description: 'operation description'})
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            composition: 'Entity.FindMany',
            compositionOptions: {
              type: 'Customer'
            },
            method: 'GET',
            description: 'operation description',
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany(Customer)
            .Filter('_id', '=, !=')
            .Filter('givenName', ['=', '!=', 'like'])
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Entity.FindMany',
            compositionOptions: {
              type: 'Customer',
              filters: [
                {field: '_id', operators: ['=', '!=']},
                {field: 'givenName', operators: ['=', '!=', 'like']},
              ]
            },
            parameters: [
              ...defaultParameters,
              {
                description: "Determines filter fields",
                in: "query",
                name: "filter",
                type: String
              }
            ],
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should SortFields() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany(Customer)
            .SortFields('_id', 'givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Entity.FindMany',
            compositionOptions: {
              type: 'Customer',
              sortFields: ['_id', 'givenName']
            },
            parameters: [
              ...defaultParameters,
              {
                description: "Determines sort fields",
                in: "query",
                name: "sort",
                isArray: true,
                type: String
              }
            ],
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should DefaultSort() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany(Customer)
            .DefaultSort('givenName')
        findMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Entity.FindMany',
            compositionOptions: {
              type: 'Customer',
              defaultSort: ['givenName'],
            },
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"Get" decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Get(Customer, 'id', {description: 'operation description'})
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          get: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Entity.Get',
            compositionOptions: {
              type: 'Customer',
              keyField: 'id'
            },
            description: 'operation description',
            responses: [
              {
                contentType: "application/opra.instance+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"UpdateMany" decorator', function () {
    it('Should define UpdateMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.UpdateMany(Customer, {
          description: 'operation description',
          input: {
            maxContentSize: 1000
          }
        })
        updateMany() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateMany: {
            kind: 'Operation',
            method: 'PATCH',
            composition: 'Entity.UpdateMany',
            compositionOptions: {
              type: 'Customer'
            },
            description: 'operation description',
            requestBody: {
              content: [{
                contentType: "application/json",
                contentEncoding: "utf-8",
                type: Customer,
              }],
              maxContentSize: 1000,
              required: true
            },
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200',
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.UpdateMany(Customer)
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
            method: 'PATCH',
            composition: 'Entity.UpdateMany',
            compositionOptions: {
              type: 'Customer',
              filters: [
                {field: '_id', operators: ['=', '!=']},
                {field: 'givenName', operators: ['=', '!=', 'like']},
              ]
            },
            requestBody: {
              content: [{
                contentType: "application/json",
                contentEncoding: "utf-8",
                type: Customer,
              }],
              maxContentSize: undefined,
              required: true
            },
            parameters: [
              {
                description: "Determines filter fields",
                in: "query",
                name: "filter",
                type: String
              }
            ],
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200'
              }
            ],
            types: [Customer]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"Update" decorator', function () {
    const defaultParameters = [
      {
        description: "Determines fields to be exposed",
        in: "query",
        isArray: true,
        name: "fields",
        type: String
      }
    ];

    it('Should define Update operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Update(Customer, 'id', {
          description: 'operation description',
          input: {
            maxContentSize: 1000
          }
        })
        updateOne() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          updateOne: {
            kind: 'Operation',
            method: 'PATCH',
            composition: 'Entity.Update',
            compositionOptions: {
              type: 'Customer',
              keyField: 'id'
            },
            description: 'operation description',
            requestBody: {
              content: [{
                contentType: "application/json",
                contentEncoding: "utf-8",
                type: Customer,
              }],
              maxContentSize: 1000,
              required: true
            },
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.instance+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Update(Customer, 'id')
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
            method: 'PATCH',
            composition: 'Entity.Update',
            compositionOptions: {
              type: 'Customer',
              keyField: 'id',
              filters: [
                {field: '_id', operators: ['=', '!=']},
                {field: 'givenName', operators: ['=', '!=', 'like']},
              ]
            },
            requestBody: {
              content: [{
                contentType: "application/json",
                contentEncoding: "utf-8",
                type: Customer,
              }],
              maxContentSize: undefined,
              required: true
            },
            parameters: [
              ...defaultParameters,
              {
                description: "Determines filter fields",
                in: "query",
                name: "filter",
                type: String
              }
            ],
            responses: [
              {
                contentType: "application/opra.instance+json",
                statusCode: '200',
                partial: true,
                type: Customer
              }
            ],
            types: [Customer]
          }
        }
      });
    })

  })


});
