import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateTests(args: { client: OpraTestClient }) {
  describe('Collection:updateOne', () => {
    const generateData = (v?: any) => ({
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
      ...v,
    });

    afterAll(() => global.gc && global.gc());

    it('Should update instance', async () => {
      const data = generateData();

      let resp = await args.client.get('Customers@85').getResponse();
      resp.expect.toSuccess().toReturnObject();
      const oldData = resp.body.payload;

      resp = await args.client.patch('Customers@85', data).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });

      resp = await args.client.get('Customers@85').getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });
    });

    it('Should exclude exclusive fields by default', async () => {
      const data = generateData();
      const resp = await args.client.patch('Customers@85', data).getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const data = generateData();
      const resp = await args.client.patch('Customers@85', data).param('projection', '+address').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const data = generateData();
      const resp = await args.client.patch('Customers@85', data).param('projection', '_id,givenName').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = generateData();
      const resp = await args.client.patch('Customers@85', data).param('projection', '-_id,-givenName').getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainAllFields(['_id', 'givenName']);
    });

    it('Should return 204 NO-CONTENT status code if resource available', async () => {
      const data = generateData();
      const resp = await args.client
        .patch('Customers@99999', data)
        .param('projection', '-_id,-givenName')
        .getResponse();
      resp.expect.toSuccess(204);
    });
  });
}
