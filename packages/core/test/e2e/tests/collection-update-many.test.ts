import { faker } from '@faker-js/faker';
import { HttpObserveType } from '@opra/client';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateManyTests(args: { client: OpraTestClient }) {

  describe('Collection:updateMany', function () {

    it('Should update many instances', async () => {
      const data = {
        uid: faker.string.hexadecimal({length: 5})
      }
      let resp = await args.client.collection('Customers')
          .updateMany(data, {filter: '_id<=50'})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedMin(1);

      resp = await args.client.collection('Customers')
          .findMany({
            filter: '_id<=50 and uid="' + data.uid + '"',
            limit: 1000000
          })
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toMatch(data);
    })

  })
}
