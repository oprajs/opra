import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateTests(args: { client: OpraTestClient }) {

  describe('Collection:updateOne', function () {

    it('Should update instance', async () => {
      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(85)
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject();
      const oldData = resp.body;

      resp = await args.client.collection('Customers')
          .update(oldData._id, data)
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...oldData, ...data, address: undefined});

      resp = await args.client.collection('Customers')
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
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch('response');
      const oldData = resp.body;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {pick: ['_id', 'givenName']})
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
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch('response');
      const oldData = resp.body;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {omit: ['_id', 'givenName']})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .get(100)
          .fetch('response');
      const oldData = resp.body;
      resp.expect
          .toSuccess()
          .toReturnObject();

      resp = await args.client.collection('Customers')
          .update(oldData._id, data, {include: ['address']})
          .fetch('response');
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['address']);
    })

  })
}
