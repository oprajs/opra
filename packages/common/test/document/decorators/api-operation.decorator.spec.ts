import 'reflect-metadata';
import { ApiField, ComplexType, HTTP_CONTROLLER_METADATA, HttpOperation, HttpStatusCode } from '@opra/common';
import { Customer } from '../../_support/test-api/index.js';

describe('HttpOperation decorator', function () {
  afterAll(() => global.gc && global.gc());

  it('Should define operation metadata', async function () {
    class CustomersResource {
      @HttpOperation({ description: 'any description' })
      getMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        getMessage: {
          kind: 'HttpOperation',
          description: 'any description',
        },
      },
    });
  });

  it('Should .Cookie() define cookie parameter', async function () {
    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).Cookie('customerId', String)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          method: 'POST',
          parameters: [
            {
              name: 'customerId',
              type: String,
              location: 'cookie',
            },
          ],
        },
      },
    });
  });

  it('Should .Header() define header parameter', async function () {
    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).Header('customerId', String)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          method: 'POST',
          parameters: [
            {
              name: 'customerId',
              type: String,
              location: 'header',
            },
          ],
        },
      },
    });
  });

  it('Should .QueryParam() define query parameter', async function () {
    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).QueryParam('customerId', String)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          method: 'POST',
          parameters: [
            {
              name: 'customerId',
              type: String,
              location: 'query',
            },
          ],
        },
      },
    });
  });

  it('Should .PathParam() define path parameter', async function () {
    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).PathParam('customerId', String)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          method: 'POST',
          parameters: [
            {
              name: 'customerId',
              type: String,
              location: 'path',
            },
          ],
        },
      },
    });
  });

  it('Should .UseType() add type to metadata', async function () {
    @ComplexType()
    class Message {
      @ApiField()
      text: string;
    }

    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).UseType(Message)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          method: 'POST',
          types: [Message],
        },
      },
    });
  });

  it('Should Response(Type) define response options', async function () {
    class CustomersResource {
      @HttpOperation().Response(HttpStatusCode.OK, { type: String })
      getMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        getMessage: {
          kind: 'HttpOperation',
          responses: [
            {
              statusCode: 200,
              type: String,
              contentEncoding: 'utf-8',
              contentType: 'application/opra.response+json',
            },
          ],
        },
      },
    });
  });

  it('Should Response({args}) define response options', async function () {
    class CustomersResource {
      @HttpOperation().Response(HttpStatusCode.OK, {
        type: String,
        description: 'response description',
      })
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          responses: [
            {
              statusCode: 200,
              type: String,
              description: 'response description',
              contentEncoding: 'utf-8',
              contentType: 'application/opra.response+json',
            },
          ],
        },
      },
    });
  });

  it('Should RequestContent(Type) define request content options', async function () {
    class CustomersResource {
      @HttpOperation().RequestContent(Customer)
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          requestBody: {
            content: [
              {
                contentEncoding: 'utf-8',
                contentType: 'application/json',
                type: Customer,
              },
            ],
            required: true,
          },
        },
      },
    });
  });

  it('Should MultipartContent({args}) define request content options', async function () {
    class CustomersResource {
      @HttpOperation().MultipartContent(
        {
          description: 'description',
        },
        config => {
          config.Field('imageX_name');
          config.File(/^imageX\d/, { contentType: 'img/jpeg, img/png' });
          config.Field('imageY_name');
          config.File(/^imageY\d/, { contentType: ['img/jpeg, img/png', 'img/gif'] });
        },
      )
      sendMessage() {}
    }

    const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, CustomersResource);
    expect(metadata).toEqual({
      operations: {
        sendMessage: {
          kind: 'HttpOperation',
          requestBody: {
            content: [
              {
                contentType: 'multipart/form-data',
                description: 'description',
                multipartFields: [
                  {
                    fieldName: 'imageX_name',
                    fieldType: 'field',
                  },
                  {
                    contentType: 'img/jpeg, img/png',
                    fieldName: expect.any(RegExp),
                    fieldType: 'file',
                  },
                  {
                    fieldName: 'imageY_name',
                    fieldType: 'field',
                  },
                  {
                    contentType: ['img/jpeg, img/png', 'img/gif'],
                    fieldName: expect.any(RegExp),
                    fieldType: 'file',
                  },
                ],
              },
            ],
            required: true,
          },
        },
      },
    });
  });
});
