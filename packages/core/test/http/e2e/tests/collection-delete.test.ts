import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function collectionDeleteTests(args: { client: OpraTestClient }) {
  describe('Collection:delete', function () {
    afterAll(() => global.gc && global.gc());

    it('Should delete instance', async () => {
      let resp = await args.client.get('Customers@1000').getResponse();
      resp.expect.toSuccess().toReturnObject().toMatch({ _id: 1000 });

      resp = await args.client.delete('Customers@1000').getResponse();
      resp.expect.toSuccess(HttpStatusCode.OK).toReturnOperationResult().toBeAffected();

      resp = await args.client.get('Customers@1000').getResponse();
      resp.expect.toSuccess(HttpStatusCode.NO_CONTENT);
    });
  });
}
