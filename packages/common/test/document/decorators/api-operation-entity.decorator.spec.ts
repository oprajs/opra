import 'reflect-metadata';
import { Customer } from 'customer-mongo/models';
import { FieldPathType, FilterType, HTTP_CONTROLLER_METADATA, HttpOperation, IntegerType } from '@opra/common';

describe('HttpOperation.Entity.* decorators', function () {
  afterAll(() => global.gc && global.gc());

  const queryParams = {
    limit: {
      location: 'query',
      name: 'limit',
      description: expect.any(String),
      type: new IntegerType({
        minValue: 1,
      }),
    },
    skip: {
      location: 'query',
      name: 'skip',
      description: expect.any(String),
      type: new IntegerType({
        minValue: 1,
      }),
    },
    count: {
      location: 'query',
      name: 'count',
      description: expect.any(String),
      type: Boolean,
    },
    projection: {
      location: 'query',
      name: 'projection',
      description: expect.any(String),
      isArray: true,
      type: expect.any(FieldPathType),
      arraySeparator: ',',
    },
    filter: {
      location: 'query',
      description: 'Determines filter fields',
      name: 'filter',
      type: {
        dataType: Customer,
        rules: {},
      },
    },
    sort: {
      location: 'query',
      name: 'sort',
      description: 'Determines sort fields',
      isArray: true,
      arraySeparator: ',',
      type: expect.any(FieldPathType),
    },
  };

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
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['projection']);
      expect(opr.parameters.find(prm => prm.name === 'projection')).toEqual({
        location: 'query',
        name: 'projection',
        description: expect.any(String),
        isArray: true,
        arraySeparator: ',',
        type: expect.any(FieldPathType),
      });
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
          partial: 'deep',
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
        @HttpOperation.Entity.Delete({
          type: Customer,
          description: 'operation description',
        }).KeyParam('id', 'number')
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
        keyParameter: 'id',
      });
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['id']);
      expect(opr.parameters.find(prm => prm.name === 'id')).toEqual({
        location: 'path',
        name: 'id',
        type: 'number',
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
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['filter']);
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual({
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
      });
    });
  });

  /* ***************************************************** */
  describe('"FindMany" decorator', function () {
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
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual([
        'limit',
        'skip',
        'count',
        'projection',
        'filter',
        'sort',
      ]);
      expect(opr.parameters.find(prm => prm.name === 'limit')).toEqual(queryParams.limit);
      expect(opr.parameters.find(prm => prm.name === 'skip')).toEqual(queryParams.skip);
      expect(opr.parameters.find(prm => prm.name === 'count')).toEqual(queryParams.count);
      expect(opr.parameters.find(prm => prm.name === 'projection')).toEqual(queryParams.projection);
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual(queryParams.filter);
      expect(opr.parameters.find(prm => prm.name === 'sort')).toEqual(queryParams.sort);
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual({
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
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
      expect(opr.parameters.find(prm => prm.name === 'sort')).toEqual({
        location: 'query',
        name: 'sort',
        description: 'Determines sort fields',
        isArray: true,
        arraySeparator: ',',
        type: expect.any(FieldPathType),
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
        @HttpOperation.Entity.Get({
          type: Customer,
          description: 'operation description',
        }).KeyParam('id')
        get() {}
      }

      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomerResource);
      const opr = metadata.operations?.get;
      expect(opr).toBeDefined();
      expect(opr.method).toEqual('GET');
      expect(opr.path).toEqual('@:id');
      expect(opr.types).toEqual([Customer]);
      expect(opr.composition).toEqual('Entity.Get');
      expect(opr.compositionOptions).toEqual({
        type: 'Customer',
        keyParameter: 'id',
      });
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['projection', 'id']);
      expect(opr.parameters.find(prm => prm.name === 'projection')).toEqual({
        location: 'query',
        name: 'projection',
        description: expect.any(String),
        isArray: true,
        arraySeparator: ',',
        type: expect.any(FieldPathType),
      });
      expect(opr.parameters.find(prm => prm.name === 'id')).toEqual({
        location: 'path',
        name: 'id',
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
        partial: 'deep',
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
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['filter']);
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual({
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
      });
    });
  });

  /* ***************************************************** */
  describe('"Update" decorator', function () {
    it('Should define Update operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Entity.Update({
          type: Customer,
          description: 'operation description',
          requestBody: {
            maxContentSize: 1000,
          },
        }).KeyParam('id', 'number')
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
        keyParameter: 'id',
      });
      expect(opr.types).toEqual([Customer]);
      expect(opr.parameters.map(prm => prm.name)).toStrictEqual(['projection', 'filter', 'id']);
      expect(opr.parameters.find(prm => prm.name === 'projection')).toEqual({
        location: 'query',
        name: 'projection',
        description: expect.any(String),
        isArray: true,
        arraySeparator: ',',
        type: expect.any(FieldPathType),
      });
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual({
        description: expect.any(String),
        location: 'query',
        name: 'filter',
        type: expect.any(FilterType),
      });
      expect(opr.parameters.find(prm => prm.name === 'id')).toEqual({
        location: 'path',
        name: 'id',
        type: 'number',
      });
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
        partial: 'deep',
      });
      expect(opr.responses).toEqual([
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: expect.any(Function),
          partial: 'deep',
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
        })
          .KeyParam('id', 'number')
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
        keyParameter: 'id',
      });
      expect(opr.parameters.find(prm => prm.name === 'filter')).toEqual({
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
      });
    });
  });
});
