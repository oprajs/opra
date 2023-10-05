import { OpraTestClient } from '@opra/testing';

export function collectionDeleteTests(args: { client: OpraTestClient }) {

  describe('Collection:deleteOne', function () {

    afterAll(() => global.gc && global.gc());

    it('Should delete instance', async () => {
      const resp = await args.client.collection('Customers')
          .delete(1001)
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedExact(1);
      await expect(() =>
          args.client.collection('Customers')
              .get(1001)
              .toPromise()
      ).rejects.toThrow('404');
    })

  })
}
