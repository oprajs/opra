import { faker } from '@faker-js/faker';
import { HttpStatusCode } from '@opra/common';
import { OpraTestClient } from '@opra/testing';

export function singletonDeleteTests(args: { client: OpraTestClient }) {
  describe('Singleton:delete', function () {
    const generateData = (v?: any) => {
      return {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
        ...v,
      };
    };

    afterAll(() => global.gc && global.gc());

    beforeAll(async () => {
      await args.client.delete('MyProfile').getResponse();
      await args.client.post('MyProfile', generateData()).getResponse();
    });

    it('Should delete instance', async () => {
      let resp = await args.client.delete('MyProfile').getResponse();
      resp.expect.toSuccess().toReturnOperationResult().toBeAffected();

      resp = await args.client.get('MyProfile').getResponse();
      resp.expect.toSuccess(HttpStatusCode.NO_CONTENT);
    });
  });
}
