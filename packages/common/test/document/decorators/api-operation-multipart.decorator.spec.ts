import 'reflect-metadata';
import { HttpOperation, RESOURCE_METADATA } from '@opra/common';


describe('HttpOperation.Multipart.* decorators', function () {

  afterAll(() => global.gc && global.gc());


  /* ***************************************************** */
  describe('"Get" decorator', function () {

    it('Should define Get operation metadata', async function () {
      class CustomerResource {
        @HttpOperation.Multipart.GET({
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
            composition: 'Multipart.GET',
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
        @HttpOperation.Multipart.POST({
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
            composition: 'Multipart.POST',
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
