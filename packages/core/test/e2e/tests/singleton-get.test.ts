import { faker } from '@faker-js/faker';
import { HttpObserveType } from '@opra/client';
import { OpraTestClient } from '@opra/testing';

export function singletonGetTests(args: { client: OpraTestClient }) {

  describe('Singleton:get', function () {
    const data = {
      _id: 1,
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }

    it('Should return error code if resource not found', async () => {
      await args.client.singleton('MyProfile').delete().fetch();
      await expect(() => args.client.singleton('MyProfile')
          .get()
          .fetch()
      ).rejects.toThrow('404');
    });

    it('Should return object', async () => {
      await args.client.singleton('MyProfile')
          .create(data)
          .fetch();

      const resp = await args.client.singleton('MyProfile')
          .get()
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...data, address: undefined})
    });


    it('Should not fetch exclusive fields (unless not included for resolver)', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get()
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['address', 'notes']);
    })

    it('Should pick fields to be returned', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({pick: ['_id', 'givenName']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({omit: ['_id', 'givenName']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({include: ['address']})
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['address']);
      expect(resp.body.address).toBeDefined();
    })

  })
}
