import { faker } from '@faker-js/faker';
import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function singletonGetTests(args: { client: OpraTestClient }) {
  describe('Singleton:get', () => {
    const data = {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
    };

    afterAll(() => global.gc && global.gc());

    beforeAll(async () => {
      await args.client.delete('auth/MyProfile').getResponse();
      await args.client.post('auth/MyProfile', data).getResponse();
    });

    it('Should return object', async () => {
      const resp = await args.client.get('auth/MyProfile').getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
    });

    it('Should exclude exclusive fields by default', async () => {
      const resp = await args.client.get('auth/MyProfile').getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const resp = await args.client.get('auth/MyProfile').param('projection', '+address').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const resp = await args.client.get('auth/MyProfile').param('projection', '_id,givenName').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should return 204 NO-CONTENT status code if resource available', async () => {
      await args.client.delete('auth/MyProfile').getResponse();
      const resp = await args.client.get('auth/MyProfile').getResponse();
      resp.expect.toSuccess(HttpStatusCode.NO_CONTENT);
    });
  });
}
