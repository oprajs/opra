import { OpraTestClient } from '@opra/testing';

export function collectionDeleteTests(args: { client: OpraTestClient }) {

  describe('Collection:deleteOne', function () {

    it('Should delete instance', async () => {
      const resp = await args.client.collection('Customers')
          .delete(1001)
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedExact(1);
      await expect(() =>
          args.client.collection('Customers')
              .get(1001)
              .fetch()
      ).rejects.toThrow('404');
    })

  })
}
