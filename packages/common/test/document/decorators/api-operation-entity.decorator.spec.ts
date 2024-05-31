import 'reflect-metadata';
import { FieldPathType, HTTP_CONTROLLER_METADATA, HttpOperation, IntegerType, OperationResult } from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';

describe('HttpOperation.Entity.* decorators', function () {
  afterAll(() => global.gc && global.gc());

  /* ***************************************************** */
  describe('"Create" decorator', function () {
    it('Should define Create operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Create({
          type: Customer,
          description: 'operation description',
          requestBody: {
            maxContentSize: 1000,
          },
        })
        create() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.create;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('POST');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.Create');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.types).toEqual([Customer]);
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'fields',
          description: expect.any(String),
          isArray: true,
          arraySeparator: ',',
          type: expect.any(FieldPathType),
        },
      ]);
      expect(opr.requestBody).toEqual({
        content: [
          {
            contentType: 'application/json',
            contentEncoding: 'utf-8',
            type: Customer,
          },
        ],
        maxContentSize: 1000,
        required: true,
        immediateFetch: true,
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 201,
          type: expect.any(Function),
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"Delete" decorator', function () {
    it('Should define Delete operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Delete({ type: Customer, keyField: 'id', description: 'operation description' })
        delete() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.delete;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('DELETE');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.Delete');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        keyField: 'id',
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 200,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"DeleteMany" decorator', function () {
    it('Should define DeleteMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.DeleteMany({ type: Customer, description: 'operation description' })
        deleteMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.deleteMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('DELETE');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.DeleteMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 200,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should Filter() define filter parameter', async function () {
      class CustomerResource {
        @HttpOperation.Entity.DeleteMany({ type: Customer })
          .Filter('_id', ['=', '!='])
          .Filter('givenName', ['=', '!=', 'like'])
        deleteMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.deleteMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('DELETE');
      expect(opr.composition).toEqual('Entity.DeleteMany');
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'filter',
          description: 'Determines filter fields',
          type: {
            dataType: Customer,
            rules: {
              _id: {
                operators: ['=', '!='],
              },
              givenName: {
                operators: ['=', '!=', 'like'],
              },
            },
          },
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"FindMany" decorator', function () {
    const queryParams = [
      {
        location: 'query',
        name: 'limit',
        description: expect.any(String),
        type: new IntegerType({
          minValue: 1,
        }),
      },
      {
        location: 'query',
        name: 'skip',
        description: expect.any(String),
        type: new IntegerType({
          minValue: 1,
        }),
      },
      {
        location: 'query',
        name: 'count',
        description: expect.any(String),
        type: Boolean,
      },
      {
        location: 'query',
        name: 'fields',
        description: expect.any(String),
        isArray: true,
        type: expect.any(FieldPathType),
        arraySeparator: ',',
      },
    ];

    it('Should define FindMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany({ type: Customer, description: 'operation description' })
        findMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.findMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.FindMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.parameters).toEqual(queryParams);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          isArray: true,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany({ type: Customer })
          .Filter('_id', '=, !=')
          .Filter('givenName', ['=', '!=', 'like'])
        findMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.findMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.FindMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.parameters).toEqual([
        ...queryParams,
        {
          location: 'query',
          description: 'Determines filter fields',
          name: 'filter',
          type: {
            dataType: Customer,
            rules: {
              _id: {
                operators: ['=', '!='],
              },
              givenName: {
                operators: ['=', '!=', 'like'],
              },
            },
          },
        },
      ]);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          isArray: true,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should SortFields() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany({ type: Customer }).SortFields('_id', 'givenName')
        findMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.findMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.FindMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        sortFields: ['_id', 'givenName'],
      });
      expect(opr.parameters).toEqual([
        ...queryParams,
        {
          location: 'query',
          name: 'sort',
          description: 'Determines sort fields',
          isArray: true,
          arraySeparator: ',',
          type: expect.any(FieldPathType),
        },
      ]);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          isArray: true,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should DefaultSort() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.FindMany({ type: Customer }).DefaultSort('givenName')
        findMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.findMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.FindMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        defaultSort: ['givenName'],
      });
      expect(opr.parameters).toEqual(queryParams);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          isArray: true,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"Get" decorator', function () {
    it('Should define Get operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Get({ type: Customer, keyField: 'id', description: 'operation description' })
        get() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.get;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.Get');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        keyField: 'id',
      });
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'fields',
          description: expect.any(String),
          isArray: true,
          arraySeparator: ',',
          type: expect.any(FieldPathType),
        },
      ]);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
        },
        {
          description: expect.any(String),
          statusCode: 204,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"UpdateMany" decorator', function () {
    it('Should define UpdateMany operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.UpdateMany({
          type: Customer,
          description: 'operation description',
          requestBody: {
            maxContentSize: 1000,
          },
        })
        updateMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.updateMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('PATCH');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.UpdateMany');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.types).toEqual([Customer]);
      expect(opr.requestBody).toEqual({
        content: [
          {
            contentType: 'application/json',
            contentEncoding: 'utf-8',
            type: Customer,
          },
        ],
        maxContentSize: 1000,
        required: true,
        immediateFetch: true,
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 200,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.UpdateMany({ type: Customer })
          .Filter('_id', '=, !=')
          .Filter('givenName', ['=', '!=', 'like'])
        updateMany() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.updateMany;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('PATCH');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
      });
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'filter',
          description: 'Determines filter fields',
          type: {
            dataType: Customer,
            rules: {
              _id: {
                operators: ['=', '!='],
              },
              givenName: {
                operators: ['=', '!=', 'like'],
              },
            },
          },
        },
      ]);
    });
  });

  /* ***************************************************** */
  describe('"Update" decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Update({
          type: Customer,
          keyField: 'id',
          description: 'operation description',
          requestBody: {
            maxContentSize: 1000,
          },
        })
        updateOne() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.updateOne;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('PATCH');
      expect(opr.description).toEqual('operation description');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.Update');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        keyField: 'id',
      });
      expect(opr.types).toEqual([Customer]);
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'fields',
          description: expect.any(String),
          isArray: true,
          arraySeparator: ',',
          type: expect.any(FieldPathType),
        },
      ]);
      expect(opr.requestBody).toEqual({
        content: [
          {
            contentType: 'application/json',
            contentEncoding: 'utf-8',
            type: Customer,
          },
        ],
        maxContentSize: 1000,
        required: true,
        immediateFetch: true,
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
        },
        {
          description: expect.any(String),
          statusCode: 204,
        },
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 422,
        },
      ]);
    });

    it('Should Filter() define metadata value', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Update({
          type: Customer,
          keyField: 'id',
        })
          .Filter('_id', '=, !=')
          .Filter('givenName', ['=', '!=', 'like'])
        updateOne() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.updateOne;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('PATCH');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        keyField: 'id',
      });
      expect(opr.parameters).toEqual([
        {
          location: 'query',
          name: 'fields',
          description: expect.any(String),
          isArray: true,
          arraySeparator: ',',
          type: expect.any(FieldPathType),
        },
        {
          location: 'query',
          name: 'filter',
          description: expect.any(String),
          type: {
            dataType: Customer,
            rules: {
              _id: {
                operators: ['=', '!='],
              },
              givenName: {
                operators: ['=', '!=', 'like'],
              },
            },
          },
        },
      ]);
    });
  });
});
