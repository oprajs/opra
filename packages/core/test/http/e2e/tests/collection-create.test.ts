import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionCreateTests(args: { client: OpraTestClient }) {
  describe('Collection:create', function () {
    afterAll(() => global.gc && global.gc());
    const generateData = (v?: any) => {
      return {
        _id: 1001,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
        ...v,
      };
    };

    it('Should create instance', async () => {
      const data = generateData({ _id: 1001 });
      let resp = await args.client.post('Customers', data).getResponse();
      resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
      resp = await args.client.get('Customers@1001').getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...data, address: undefined });
    });

    it('Should exclude exclusive fields by default', async () => {
      const data = generateData({ _id: 1002 });
      const resp = await args.client.post('Customers', data).getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['address', 'notes']);
    });

    it('Should fetch exclusive fields if requested', async () => {
      const data = generateData({ _id: 1003 });
      const resp = await args.client.post('Customers', data).param('projection', '+address').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['_id', 'givenName', 'address']);
    });

    it('Should pick fields to be returned', async () => {
      const data = generateData({ _id: 1004 });
      const resp = await args.client.post('Customers', data).param('projection', '_id,givenName').getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = generateData({ _id: 1005 });
      const resp = await args.client.post('Customers', data).param('projection', '-_id,-givenName').getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainAllFields(['_id', 'givenName']);
    });
  });
}
