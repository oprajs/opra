import { OpraTestClient } from '@opra/testing';

export function entityGetTests(args: { client: OpraTestClient }) {
  describe('Collection:get', function () {
    afterAll(() => global.gc && global.gc());

    it('Should return object', async () => {
      const resp = await args.client.get('Customers@1').getResponse();
      resp.expect.toSuccess().toReturnObject().toMatch({ _id: 1 });
    });

    it('Should return error code if resource not found', async () => {
      const resp = await args.client.get('Customers@999999').getResponse();
      resp.expect.toSuccess(204);
    });

    it('Should not fetch exclusive fields (unless not included for resolver)', async () => {
      const resp = await args.client.get('Customers@1').getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['address', 'notes']);
    });

    // it('Should pick fields to be returned', async () => {
    //   const resp = await args.client
    //     .collection('Customers')
    //     .get(1, { pick: ['_id', 'givenName'] })
    //     .getResponse();
    //   resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    // });
    //
    // it('Should omit fields to be returned', async () => {
    //   const resp = await args.client
    //     .collection('Customers')
    //     .get(1, { omit: ['_id', 'givenName'] })
    //     .getResponse();
    //   resp.expect.toSuccess().toReturnObject().not.toContainFields(['_id', 'givenName']);
    // });
    //
    // it('Should include exclusive fields if requested', async () => {
    //   const resp = await args.client
    //     .collection('Customers')
    //     .get(2, { include: ['address'] })
    //     .getResponse();
    //   resp.expect.toSuccess().toReturnObject().toContainFields(['address']);
    //   expect(resp.body.payload.address).toBeDefined();
    // });
  });
}
