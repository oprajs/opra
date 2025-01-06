import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionCreateTests(args: { client: OpraTestClient }) {
  describe('Collection:create', () => {
    afterAll(() => global.gc && global.gc());
    const generateData = (v?: any) => ({
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: { city: 'Izmir' },
      ...v,
    });

    it('Should create instance', async () => {
      const data = generateData();
      let resp = await args.client.post('Customers', data).getResponse();
      resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
      resp = await args.client
        .get(`Customers@${resp.body.payload._id}`)
        .getResponse();
      resp.expect
        .toSuccess(200)
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
    });

    it('Should exclude exclusive fields by default', async () => {
      const data = generateData({ _id: 1002 });
      const resp = await args.client.post('Customers', data).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const data = generateData({ _id: 1003 });
      const resp = await args.client
        .post('Customers', data)
        .param('projection', '+address')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainFields([
          '_id',
          'givenName',
          'familyName',
          'gender',
          'address',
        ]);
    });

    it('Should pick fields to be returned', async () => {
      const data = generateData({ _id: 1004 });
      const resp = await args.client
        .post('Customers', data)
        .param('projection', '_id,givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = generateData({ _id: 1005 });
      const resp = await args.client
        .post('Customers', data)
        .param('projection', '-_id,-givenName')
        .getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toContainAllFields(['_id', 'givenName']);
    });
  });
}
