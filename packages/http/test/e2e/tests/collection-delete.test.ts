import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function collectionDeleteTests(args: { client: OpraTestClient }) {
  describe('http:Collection:delete', () => {
    it('Should delete instance', async () => {
      let resp = await args.client
        .get('Customers?sort=-_id&limit=1&projection=_id')
        .getResponse();
      resp.expect.toSuccess(200).toReturnCollection().toReturnItems(1);
      const id = resp.body?.payload[0]._id;

      resp = await args.client.delete('Customers@' + id).getResponse();
      resp.expect
        .toSuccess(HttpStatusCode.OK)
        .toReturnOperationResult()
        .toBeAffected();

      resp = await args.client.get('Customers@' + id).getResponse();
      resp.expect.toSuccess(HttpStatusCode.NO_CONTENT);
    });
  });
}
