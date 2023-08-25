import { faker } from '@faker-js/faker';
import { HttpObserveType } from '@opra/client';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateTests(args: { client: OpraTestClient }) {

  describe('Collection:updateOne', function () {

    it('Should update instance', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(85)
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject();
      const oldData = resp.body.data;

      resp = await args.client.collection('Customers')
          .update(oldData._id, data)
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});

      resp = await args.client.collection('Customers')
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
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch(HttpObserveType.Response);
      const oldData = resp.body.data;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {pick: ['_id', 'givenName']})
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
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch(HttpObserveType.Response);
      const oldData = resp.body.data;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {omit: ['_id', 'givenName']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
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
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch(HttpObserveType.Response);
      const oldData = resp.body.data;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {include: ['address']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['address']);
    })

  })
}
