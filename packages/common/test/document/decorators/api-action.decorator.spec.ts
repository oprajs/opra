import 'reflect-metadata';
import { ApiAction, HttpStatusCode, RESOURCE_METADATA } from '@opra/common';


describe('ApiAction decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define Action operation metadata', async function () {
    class CustomersResource {
      @ApiAction({description: 'any description'})
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
      @ApiAction()
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
      @ApiAction()
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
      @ApiAction()
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
      @ApiAction()
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
