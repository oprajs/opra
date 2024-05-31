import { OpraTestClient } from '@opra/testing';

export function collectionDeleteManyTests(args: { client: OpraTestClient }) {
  describe('Collection:deleteMany', function () {
    afterAll(() => global.gc && global.gc());

    it('Should delete many instances by filter', async () => {
      const resp = await args.client.collection('Customers').deleteMany({ filter: '_id>=1001' }).getResponse();
      resp.expect.toSuccess().toReturnOperationResult().toBeAffected();
      await expect(() => args.client.collection('Customers').get(1001).getBody()).rejects.toThrow('422');
    });
  });
}
