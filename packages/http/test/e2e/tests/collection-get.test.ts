import { OpraTestClient } from '@opra/testing';

export function collectionGetTests(args: { client: OpraTestClient }) {
  describe('Collection:get', () => {
    afterAll(() => global.gc && global.gc());

    it('Should return object', async () => {
      const resp = await args.client.get('Customers@1').getResponse();
      resp.expect.toSuccess().toReturnObject().toMatch({ _id: 1 });
    });

    it('Should return 204 NO-CONTENT status code if resource available', async () => {
      const resp = await args.client.get('Customers@999999').getResponse();
      resp.expect.toSuccess(204);
    });

    it('Should exclude exclusive fields by default', async () => {
      const resp = await args.client.get('Customers@1').getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const resp = await args.client
        .get('Customers@1')
        .param('projection', '+address')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const resp = await args.client
        .get('Customers@1')
        .param('projection', '_id,givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const resp = await args.client
        .get('Customers@1')
        .param('projection', '-_id,-givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainAllFields(['_id', 'givenName']);
    });
  });
}
