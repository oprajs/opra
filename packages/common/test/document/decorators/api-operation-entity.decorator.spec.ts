import 'reflect-metadata';
import { ApiOperation, RESOURCE_METADATA } from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';


describe('ApiOperation.Entity.* decorators', function () {

  afterAll(() => global.gc && global.gc());


  /* ***************************************************** */
  describe('"Create" decorator', function () {

    const defaultParameters = [
      {
        description: "Determines fields to be picked",
        in: "query",
        isArray: true,
        name: "pick",
        type: String
      },
      {
        description: "Determines fields to be omitted",
        in: "query",
        isArray: true,
        name: "omit",
        type: String
      },
      {
        description: "Determines fields to be included",
        in: "query",
        isArray: true,
        name: "include",
        type: String
      }
    ];

    it('Should define Create operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.Create(Customer, {
          description: 'operation description',
          input: {
            maxContentSize: 1000
          }
        })
        create() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          create: {
            kind: 'Operation',
            method: 'POST',
            composition: 'Entity.Create',
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
                type: Customer
              }
            ]
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
            method: 'DELETE',
            composition: 'Entity.Delete',
            description: 'operation description',
            responses: [
              {
                contentType: "application/opra.response+json",
                statusCode: '200',
              }
            ],
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
            method: 'DELETE',
            composition: 'Entity.Delete',
            compositionOptions: {
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
        description: "Determines fields to be picked",
        in: "query",
        isArray: true,
        name: "pick",
        type: String
      },
      {
        description: "Determines fields to be omitted",
        in: "query",
        isArray: true,
        name: "omit",
        type: String
      },
      {
        description: "Determines fields to be included",
        in: "query",
        isArray: true,
        name: "include",
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
            description: 'operation description',
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                type: Customer
              }
            ]
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
      expect(metadata).toEqual({
        endpoints: {
          findMany: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Entity.FindMany',
            compositionOptions: {
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
                type: Customer
              }
            ]
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
            method: 'GET',
            composition: 'Entity.FindMany',
            compositionOptions: {
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
                type: Customer
              }
            ]
          }
        }
      });
    })

    it('Should DefaultSort() define metadata value', async function () {
      class CustomerResource {
        @ApiOperation.Entity.FindMany(Customer)
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
              defaultSort: ['givenName'],
            },
            parameters: defaultParameters,
            responses: [
              {
                contentType: "application/opra.collection+json",
                statusCode: '200',
                type: Customer
              }
            ]
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
            method: 'GET',
            composition: 'Entity.FindOne',
            description: 'operation description',
            responses: [
              {
                contentType: "application/opra.instance+json",
                statusCode: '200',
                type: Customer
              }
            ]
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
            method: 'GET',
            composition: 'Entity.FindOne',
            compositionOptions: {
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
                contentType: "application/opra.instance+json",
                statusCode: '200',
                type: Customer
              }
            ]
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
                statusCode: '200'
              }
            ]
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
            method: 'PATCH',
            composition: 'Entity.UpdateMany',
            compositionOptions: {
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
            ]
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"UpdateOne" decorator', function () {
    const defaultParameters = [
      {
        description: "Determines fields to be picked",
        in: "query",
        isArray: true,
        name: "pick",
        type: String
      },
      {
        description: "Determines fields to be omitted",
        in: "query",
        isArray: true,
        name: "omit",
        type: String
      },
      {
        description: "Determines fields to be included",
        in: "query",
        isArray: true,
        name: "include",
        type: String
      }
    ];

    it('Should define UpdateOne operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Entity.UpdateOne(Customer, {
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
            composition: 'Entity.UpdateOne',
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
                type: Customer
              }
            ]
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
            method: 'PATCH',
            composition: 'Entity.UpdateOne',
            compositionOptions: {
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
                type: Customer
              }
            ]
          }
        }
      });
    })

  })


});
