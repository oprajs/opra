import { faker } from '@faker-js/faker';
import { HttpObserveType } from '@opra/client';
import { OpraTestClient } from '@opra/testing';

export function singletonDeleteTests(args: { client: OpraTestClient }) {

  describe('Singleton:delete', function () {
    const data = {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }

    it('Should delete instance', async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .fetch(HttpObserveType.Response);
      let resp = await args.client.singleton('MyProfile')
          .create(data)
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toMatch({...data, address: undefined});

      resp = await args.client.singleton('MyProfile')
          .delete()
          .fetch(HttpObserveType.Response);
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedExact(1);
      await expect(() =>
          args.client.singleton('MyProfile')
              .get()
              .fetch()
      ).rejects.toThrow('404');
    })

  })
}
