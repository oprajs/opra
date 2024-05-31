import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonUpdateTests(args: { client: OpraTestClient }) {
  describe('Singleton:update', function () {
    beforeAll(async () => {
      await args.client.singleton('MyProfile').delete().getResponse();
      await args.client
        .singleton('MyProfile')
        .create({
          givenName: faker.person.firstName(),
          familyName: faker.person.lastName(),
          gender: 'F',
          address: { city: 'Istanbul' },
        })
        .getResponse();
    });

    afterAll(() => global.gc && global.gc());

    it('Should update instance', async () => {
      let resp = await args.client.singleton('MyProfile').get().getResponse();
      resp.expect.toSuccess().toReturnObject();
      const oldData = resp.body.payload;

      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
      };

      resp = await args.client.singleton('MyProfile').update(data).getResponse();

      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });

      resp = await args.client.singleton('MyProfile').get(oldData._id).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });
    });

    it('Should pick fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
      };
      const resp = await args.client
        .singleton('MyProfile')
        .update(data, { pick: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'F',
      };
      const resp = await args.client
        .singleton('MyProfile')
        .update(data, { omit: ['givenName', 'gender'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['givenName', 'gender']);
    });

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'F',
      };
      const resp = await args.client
        .singleton('MyProfile')
        .update(data, { include: ['address'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['givenName', 'gender', 'address']);
    });
  });
}
