import 'reflect-metadata';
import { ApiEntityDecoratorOptions } from '@opra/common/src/index.js';
import { RESOURCE_METADATA } from '../../src/constants.js';
import { ApiEntityResource } from '../../src/index.js';
import { Address } from '../_support/test-app/dto/address.dto.js';

describe('Api decorators', function () {

  describe('@ApiEntityResource() decorator', function () {

    it('Should define entity resource metadata', async () => {
      const opts: ApiEntityDecoratorOptions = {primaryKey: 'id'};

      class AnimalResource {
      }

      ApiEntityResource(Address, opts)(AnimalResource);

      const metadata = Reflect.getMetadata(RESOURCE_METADATA, AnimalResource);
      expect(metadata).toStrictEqual({
        kind: 'EntityResource',
        name: 'Animal',
        type: Address,
        ...opts
      });
    })

  });

});
