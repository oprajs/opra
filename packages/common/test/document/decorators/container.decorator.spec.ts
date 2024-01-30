import 'reflect-metadata';
import { Container, RESOURCE_METADATA } from '@opra/common';

describe('Container decorators', function () {

  afterAll(() => global.gc && global.gc());

  /* ***************************************************** */
  describe('@Container() decorator', function () {

    it('Should define Container resource metadata', async function () {
      const opts: Container.DecoratorOptions = {description: 'xyz'};

      @Container(opts)
      class AuthController {
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, AuthController);
      expect(metadata).toStrictEqual({
        kind: 'Container',
        name: 'auth',
        ...opts
      });
    })

    it('Should define custom name', async function () {
      const opts: Container.DecoratorOptions = {name: 'Authorization'};

      @Container(opts)
      class AuthController {
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, AuthController);
      expect(metadata).toStrictEqual({
        kind: 'Container',
        name: 'Authorization',
        ...opts
      });
    })
  })


  /* ***************************************************** */
  describe('@Container.Action() decorator', function () {
    it('Should define Action operation metadata', async function () {
      class Resource1 {
        @Container.Action({
              description: 'action'
            }
        )
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, Resource1);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })

    it('Should define returnType in options', async function () {
      class Resource1 {
        @Container.Action({
              description: 'action',
              returnType: 'number'
            }
        )
        sendMessage() {
        }
      }

      const metadata1 = Reflect.getMetadata(RESOURCE_METADATA, Resource1);
      expect(metadata1.actions).toStrictEqual({
        sendMessage: {
          description: 'action',
          returnType: 'number'
        }
      });

    })

    it('Should define returnType with decorator', async function () {
      class Resource1 {
        @Container.Action({description: 'action'})
            .Returns('string')
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, Resource1);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {
          description: 'action',
          returnType: 'string'
        }
      });
    })

    it('Should Parameter() define metadata value', async function () {
      class Resource1 {
        @Container.Action()
            .Parameter('message', String)
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, Resource1);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {parameters: [{name: 'message', type: String}]}
      });
    })
  })

});
