import { faker } from '@faker-js/faker';
import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function singletonDeleteTests(args: { client: OpraTestClient }) {
  describe('http:Singleton:delete', () => {
    const generateData = (v?: any) => ({
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
      ...v,
    });

    before(async () => {
      await args.client.delete('auth/MyProfile').getResponse();
      await args.client.post('auth/MyProfile', generateData()).getResponse();
    });

    it('Should delete instance', async () => {
      let resp = await args.client.delete('auth/MyProfile').getResponse();
      resp.expect.toSuccess().toReturnOperationResult().toBeAffected();

      resp = await args.client.get('auth/MyProfile').getResponse();
      resp.expect.toSuccess(HttpStatusCode.NO_CONTENT);
    });
  });
}
