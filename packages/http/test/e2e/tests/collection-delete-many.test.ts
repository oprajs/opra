import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function collectionDeleteManyTests(args: { client: OpraTestClient }) {
  describe('Collection:deleteMany', () => {
    afterAll(() => global.gc && global.gc());

    it('Should delete many instances by filter', async () => {
      /** Total count of records which id<990 */
      let resp = await args.client
        .get('Customers')
        .param({ filter: '_id<990', count: true })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection();
      const totalMatches1 = resp.body.totalMatches;
      expect(totalMatches1).toBeGreaterThan(0);

      /** Total count of records which id=>990 */
      resp = await args.client
        .get('Customers')
        .param({ filter: '_id>=990', count: true })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection();
      const totalMatches2 = resp.body.totalMatches;
      expect(totalMatches2).toBeGreaterThan(0);

      /** Delete records which id=>990 */
      resp = await args.client
        .delete('Customers')
        .param({ filter: '_id>=990' })
        .getResponse();
      resp.expect
        .toSuccess(HttpStatusCode.OK)
        .toReturnOperationResult()
        .toBeAffected();

      /** Total count of records which id<990 */
      resp = await args.client
        .get('Customers')
        .param({ filter: '_id<990', count: true })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection();
      expect(resp.body.totalMatches).toEqual(totalMatches1);

      resp = await args.client
        .get('Customers')
        .param({ filter: '_id>=990', count: true })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection();
      expect(resp.body.totalMatches).toEqual(0);
    });
  });
}
