import 'reflect-metadata';
import { Api } from '../../src';
import { RESOURCE_METADATA, RESOURCE_OPERATION, RESOURCE_OPERATION_FUNCTIONS } from '../../src/constants';
import { Address } from '../_support/test-app/dto/address.dto';

describe('Api decorators', function () {

  describe('Api.Entity() decorator', function () {

    it('Should define entity resource metadata', async () => {
      const opts: Api.EntityDecoratorOptions = {primaryKey: 'id'};

      class AnimalResource {
      }

      Api.EntityResource(Address, opts)(AnimalResource);

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, AnimalResource);
      expect(metadata).toStrictEqual({
        kind: 'EntityResource',
        name: 'Animal',
        type: Address,
        ...opts
      });
    })

  });

  describe('Api.ReadHandler() decorator', function () {

    it('Should define read handle', async () => {
      class AnimalResource {
        @Api.ReadHandler()
        read() {
          //
        }
      }

      const methods = Reflect.getMetadata(RESOURCE_OPERATION_FUNCTIONS, AnimalResource.prototype);
      expect(methods).toStrictEqual(['read']);
      for (const method of methods) {
        const metadata = Reflect.getMetadata(RESOURCE_OPERATION, AnimalResource.prototype, method);
        expect(metadata).toStrictEqual({
          kind: 'ResourceOperation',
          operation: 'read'
        });
      }
    })

  });

});
