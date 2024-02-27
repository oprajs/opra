import 'reflect-metadata';
import { ApiOperation, RESOURCE_METADATA } from '@opra/common';


describe('ApiOperation.Multipart.* decorators', function () {

  afterAll(() => global.gc && global.gc());


  /* ***************************************************** */
  describe('"Get" decorator', function () {

    it('Should define Get operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Multipart.Get({
          description: 'operation description'
        })
        get() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          get: {
            kind: 'Operation',
            method: 'GET',
            composition: 'Multipart.Get',
            description: 'operation description'
          }
        }
      });
    })

  })


  /* ***************************************************** */
  describe('"Post" decorator', function () {

    it('Should define Post operation metadata', async function () {
      class CustomerResource {
        @ApiOperation.Multipart.Post({
          description: 'operation description'
        })
        post() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomerResource);
      expect(metadata).toStrictEqual({
        endpoints: {
          post: {
            kind: 'Operation',
            method: 'POST',
            composition: 'Multipart.Post',
            compositionOptions: {},
            description: 'operation description',
            requestBody: {
              content: [
                {
                  contentType: "multipart/form-data"
                }
              ]
            }
          }
        }
      });
    })

  })

});
