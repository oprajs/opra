import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonCreateTests(args: { client: OpraTestClient }) {
  describe('Singleton:create', () => {
    const generateData = (v?: any) => ({
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
      ...v,
    });

    afterAll(() => global.gc && global.gc());

    beforeEach(async () => {
      await args.client.delete('auth/MyProfile').getResponse();
    });

    it('Should create instance', async () => {
      const data = generateData();
      let resp = await args.client.post('auth/MyProfile', data).getResponse();
      resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
      resp = await args.client.get('auth/MyProfile').getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
    });

    it('Should exclude exclusive fields by default', async () => {
      const data = generateData();
      const resp = await args.client.post('auth/MyProfile', data).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const data = generateData();
      const resp = await args.client
        .post('auth/MyProfile', data)
        .param('projection', '+address')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const data = generateData();
      const resp = await args.client
        .post('auth/MyProfile', data)
        .param('projection', '_id,givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = generateData();
      const resp = await args.client
        .post('auth/MyProfile', data)
        .param('projection', '-_id,-givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainAllFields(['_id', 'givenName']);
    });
  });
}
