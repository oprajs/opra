import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonCreateTests(args: { client: OpraTestClient }) {

  describe('Singleton:create', function () {

    beforeEach(async ()=>{
      await args.client.singleton('MyProfile')
          .delete()
          .fetch('response');
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
          .fetch('response');
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toMatch({...data, address: undefined});
      resp = await args.client.singleton('MyProfile')
          .get()
          .fetch('response');
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
          .create(data, {pick: ['givenName']})
          .fetch('response');
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toHaveFieldsOnly(['_id', 'givenName']);
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
          .fetch('response');
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
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
          .fetch('response');
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toHaveFields(['address']);
    })
  })
}
