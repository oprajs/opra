import { OpraTestClient } from '@opra/testing';

export function collectionFindManyTests(args: { client: OpraTestClient }) {
  describe('Collection:findMany', () => {
    afterAll(() => global.gc && global.gc());

    it('Should return list object', async () => {
      const resp = await args.client.get('Customers').getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems();
    });

    it('Test "count" option', async () => {
      const resp = await args.client
        .get('Customers')
        .param({ count: true })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems();
      expect(resp.body.totalMatches).toBeGreaterThan(0);
    });

    it('Test "limit" option', async () => {
      const resp = await args.client
        .get('Customers')
        .param({ limit: '3' })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems(1, 3);
    });

    it('Test "sort" option', async () => {
      const resp = await args.client
        .get('Customers')
        .param({ sort: 'givenName' })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toBeSortedBy('givenName');
    });

    it('Test "skip" option', async () => {
      const resp = await args.client
        .get('Customers')
        .param({ skip: '10', sort: '_id' })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems();
      expect(resp.body.payload?.[0]._id).toBeGreaterThanOrEqual(10);
    });

    it('Should exclude exclusive fields by default', async () => {
      const resp = await args.client.get('Customers').getResponse();
      resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const resp = await args.client
        .get('Customers')
        .param('projection', '+address')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnCollection()
        .toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const resp = await args.client
        .get('Customers')
        .param('projection', '_id,givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnCollection()
        .toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const resp = await args.client
        .get('Customers')
        .param('projection', '-_id,-givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toContainAllFields(['_id', 'givenName']);
    });
  });
}
