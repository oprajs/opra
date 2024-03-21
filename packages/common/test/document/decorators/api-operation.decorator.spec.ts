import 'reflect-metadata';
import { HttpOperation, HttpStatusCode, RESOURCE_METADATA } from '@opra/common';


describe('HttpOperation decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define Action operation metadata', async function () {
    class CustomersResource {
      @HttpOperation({description: 'any description'})
      getMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        getMessage: {
          kind: 'Operation',
          method: 'GET',
          description: 'any description'
        }
      }
    });
  })

  it('Should Parameter() define query parameter', async function () {
    class CustomersResource {
      @HttpOperation({
        method: 'POST',
      }).Parameter('message', String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          method: 'POST',
          parameters: [{
            name: 'message',
            type: String
          }]
        }
      }
    });
  })

  it('Should Header() define header parameter', async function () {
    class CustomersResource {
      @HttpOperation()
          .Header('x-id', String)
      getMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        getMessage: {
          kind: 'Operation',
          method: 'GET',
          headers: [{
            name: 'x-id',
            type: String
          }]
        }
      }
    });
  })

  it('Should Response(Type) define response options', async function () {
    class CustomersResource {
      @HttpOperation()
          .Response(HttpStatusCode.OK, String)
      getMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        getMessage: {
          kind: 'Operation',
          method: 'GET',
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
      @HttpOperation()
          .Response({
            type: String,
            description: 'response description',
            statusCode: HttpStatusCode.OK
          })
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          method: 'GET',
          responses: [{
            statusCode: '200',
            type: String,
            description: 'response description',
          }]
        }
      }
    });
  })

});
