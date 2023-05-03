import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonUpdateTests(args: { client: OpraTestClient }) {

  describe('Singleton:update', function () {

    beforeAll(async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .fetch('response');
      await args.client.singleton('MyProfile')
          .create({
            givenName: faker.name.firstName(),
            familyName: faker.name.lastName(),
            gender: 'F',
            address: {city: 'Istanbul'}
          })
          .fetch('response');
    });

    it('Should update instance', async () => {
      let resp = await args.client.singleton('MyProfile')
          .get()
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject();
      const oldData = resp.body;

      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }

      resp = await args.client.singleton('MyProfile')
          .update(data)
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});

      resp = await args.client.singleton('MyProfile')
          .get(oldData._id)
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});
    })

    it('Should pick fields to be returned', async () => {
      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'X'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {pick: ['_id', 'givenName']})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFieldsOnly(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'X'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {omit: ['givenName', 'gender']})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFieldsOnly(['givenName', 'gender']);
    })

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'X'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {include: ['address']})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['givenName', 'gender', 'address']);
    })

  })
}
