import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonGetTests(args: { client: OpraTestClient }) {
  describe('Singleton:get', function () {
    const data = {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
    };

    afterAll(() => global.gc && global.gc());

    it('Should return error code if resource not found', async () => {
      await args.client.singleton('MyProfile').delete().getResponse();
      await expect(() => args.client.singleton('MyProfile').get().getBody()).rejects.toThrow('422');
    });

    it('Should return object', async () => {
      await args.client.singleton('MyProfile').create(data).getResponse();

      const resp = await args.client.singleton('MyProfile').get().getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
    });

    it('Should not fetch exclusive fields (unless not included for resolver)', async () => {
      const resp = await args.client.singleton('MyProfile').get().getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['address', 'notes']);
    });

    it('Should pick fields to be returned', async () => {
      const resp = await args.client
        .singleton('MyProfile')
        .get({ pick: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const resp = await args.client
        .singleton('MyProfile')
        .get({ omit: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['_id', 'givenName']);
    });

    it('Should include exclusive fields if requested', async () => {
      const resp = await args.client
        .singleton('MyProfile')
        .get({ include: ['address'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['address']);
    });
  });
}
