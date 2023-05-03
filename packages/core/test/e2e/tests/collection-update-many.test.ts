import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateManyTests(args: { client: OpraTestClient }) {

  describe('Collection:updateMany', function () {

    it('Should update many instances', async () => {
      const data = {
        uid: faker.datatype.hexadecimal({length: 5})
      }
      let resp = await args.client.collection('Customers')
          .updateMany(data, {filter: '_id<=50'})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedMin(1);

      resp = await args.client.collection('Customers')
          .findMany({
            filter: '_id<=50 and uid="' + data.uid + '"',
            limit: 1000000
          })
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toMatch(data);
    })

  })
}
