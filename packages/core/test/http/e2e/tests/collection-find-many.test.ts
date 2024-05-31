import { OpraTestClient } from '@opra/testing';

export function collectionFindManyTests(args: { client: OpraTestClient }) {
  describe('Collection:findMany', function () {
    afterAll(() => global.gc && global.gc());

    it('Should return list object', async () => {
      const resp = await args.client.collection('Customers').findMany().getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems();
    });

    it('Test "limit" option', async () => {
      const resp = await args.client.collection('Customers').findMany({ limit: 3 }).getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems(1, 3);
    });

    it('Test "sort" option', async () => {
      const resp = await args.client
        .collection('Customers')
        .findMany({ sort: ['givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toBeSortedBy('givenName');
    });

    it('Test "skip" option', async () => {
      const resp = await args.client
        .collection('Customers')
        .findMany({ skip: 10, sort: ['_id'] })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems();
      expect(resp.body.payload?.[0]._id).toBeGreaterThanOrEqual(10);
    });

    it('Test "pick" option', async () => {
      const resp = await args.client
        .collection('Customers')
        .findMany({ pick: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().toContainAllFields(['_id', 'givenName']);
    });

    it('Test "omit" option', async () => {
      const resp = await args.client
        .collection('Customers')
        .findMany({ omit: ['givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnCollection().not.toContainFields(['givenName']);
    });

    it('Test "filter" option', async () => {
      const resp = await args.client.collection('Customers').findMany({ filter: 'gender="M"' }).getResponse();
      resp.expect.toSuccess().toReturnCollection().toReturnItems().toBeFilteredBy('gender="M"');
    });

    it('Test "count" option', async () => {
      const resp = await args.client.collection('Customers').findMany({ count: true }).getResponse();
      resp.expect.toSuccess().toReturnCollection().toContainTotalMatches(1);
    });
  });
}
