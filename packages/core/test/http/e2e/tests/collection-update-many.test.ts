import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateManyTests(args: { client: OpraTestClient }) {
  describe('Collection:updateMany', () => {
    afterAll(() => global.gc && global.gc());
    const generateData = (v?: any) => ({
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      ...v,
    });

    it.only('Should update many instances with filter', async () => {
      const data = generateData({
        uid: faker.string.hexadecimal({ length: 5 }),
      });
      const resp1 = await args.client
        .patch('Customers', data)
        .param({
          filter: '_id<=5',
        })
        .getResponse();
      resp1.expect.toSuccess().toReturnOperationResult().toBeAffected();

      let resp2 = await args.client
        .get('Customers')
        .param({
          filter: '_id<=5',
        })
        .getResponse();
      resp2.expect.toSuccess().toReturnCollection().toMatch(data);
      resp2 = await args.client
        .get('Customers')
        .param({
          filter: '_id>5',
        })
        .getResponse();
      resp2.expect.toSuccess().toReturnCollection().not.toMatch(data);
    });
  });
}
