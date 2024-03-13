import 'reflect-metadata';
import { HttpAction, HttpStatusCode, RESOURCE_METADATA } from '@opra/common';


describe('HttpAction decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define Action operation metadata', async function () {
    class CustomersResource {
      @HttpAction({description: 'any description'})
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Action',
          description: 'any description'
        }
      }
    });
  })

  it('Should Parameter() define query parameter', async function () {
    class CustomersResource {
      @HttpAction()
          .Parameter('message', String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Action',
          parameters: [{
            in: 'query',
            name: 'message',
            type: String
          }]
        }
      }
    });
  })

  it('Should Header() define header parameter', async function () {
    class CustomersResource {
      @HttpAction()
          .Header('x-id', String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Action',
          parameters: [{
            in: 'header',
            name: 'x-id',
            type: String
          }]
        }
      }
    });
  })

  it('Should Response(Type) define response options', async function () {
    class CustomersResource {
      @HttpAction()
          .Response(HttpStatusCode.OK, String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toEqual({
      endpoints: {
        sendMessage: {
          kind: 'Action',
          responses: [{
            statusCode: '200',
            type: String
          }]
        }
      }
    });
  })

  it('Should Response({args}) define response options', async function () {
    class CustomersResource {
      @HttpAction()
          .Response({
            type: String,
            description: 'response description',
            statusCode: HttpStatusCode.ACCEPTED
          })
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Action',
          responses: [{
            statusCode: '202',
            type: String,
            description: 'response description',
          }]
        }
      }
    });
  })

});
