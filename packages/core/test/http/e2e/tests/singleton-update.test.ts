import { faker } from '@faker-js/faker';
import { HttpObserveType } from '@opra/client';
import { OpraTestClient } from '@opra/testing';

export function singletonUpdateTests(args: { client: OpraTestClient }) {

  describe('Singleton:update', function () {

    beforeAll(async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .fetch(HttpObserveType.Response);
      await args.client.singleton('MyProfile')
          .create({
            givenName: faker.person.firstName(),
            familyName: faker.person.lastName(),
            gender: 'F',
            address: {city: 'Istanbul'}
          })
          .fetch(HttpObserveType.Response);
    });

    it('Should update instance', async () => {
      let resp = await args.client.singleton('MyProfile')
          .get()
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject();
      const oldData = resp.body.data;

      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }

      resp = await args.client.singleton('MyProfile')
          .update(data)
          .fetch(HttpObserveType.Response);

      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});

      resp = await args.client.singleton('MyProfile')
          .get(oldData._id)
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});
    })

    it('Should pick fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {pick: ['_id', 'givenName']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFieldsOnly(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'F'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {omit: ['givenName', 'gender']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFieldsOnly(['givenName', 'gender']);
    })

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'F'
      }
      const resp = await args.client.singleton('MyProfile')
          .update(data, {include: ['address']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['givenName', 'gender', 'address']);
    })

  })
}
