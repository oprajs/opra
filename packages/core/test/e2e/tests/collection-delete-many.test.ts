import { OpraTestClient } from '@opra/testing';

export function collectionDeleteManyTests(args: { client: OpraTestClient }) {

  describe('Collection:deleteMany', function () {

    it('Should delete many instances by filter', async () => {
      const resp = await args.client.collection('Customers')
          .deleteMany({filter: '_id>=1001'})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedMin(1);
      await expect(() => args.client.collection('Customers')
          .get(1001)
          .toPromise()
      ).rejects.toThrow('404');
    })

  })
}
