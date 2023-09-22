import 'reflect-metadata';
import { Container, RESOURCE_METADATA } from '@opra/common';

describe('Container decorators', function () {

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
        name: 'Auth',
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
      class CustomersResource {
        @Container.Action({description: 'action'})
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {description: 'action'}
      });
    })

    it('Should Parameter() define metadata value', async function () {
      class CustomersResource {
        @Container.Action()
            .Parameter('message', String)
        sendMessage() {
        }
      }

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
      expect(metadata.actions).toStrictEqual({
        sendMessage: {parameters: {message: {type: String}}}
      });
    })
  })

});
