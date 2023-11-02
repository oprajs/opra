import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonCreateTests(args: { client: OpraTestClient }) {

  describe('Singleton:create', function () {

    afterAll(() => global.gc && global.gc());

    beforeEach(async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .getResponse();
    });

    it('Should create instance', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.singleton('MyProfile')
          .create(data)
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toMatch({...data, address: undefined});
      resp = await args.client.singleton('MyProfile')
          .get()
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...data, address: undefined});
    })

    it('Should pick fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      const resp = await args.client.singleton('MyProfile')
          .create(data, {pick: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toContainAllFields(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      const resp = await args.client.singleton('MyProfile')
          .create(data, {omit: ['givenName']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .not.toContainFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      const resp = await args.client.singleton('MyProfile')
          .create(data, {include: ['address']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toContainFields(['address']);
    })
  })
}
