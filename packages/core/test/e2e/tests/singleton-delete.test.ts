import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonDeleteTests(args: { client: OpraTestClient }) {

  describe('Singleton:delete', function () {
    const data = {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }

    afterAll(() => global.gc && global.gc());

    it('Should delete instance', async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .getResponse();
      let resp = await args.client.singleton('MyProfile')
          .create(data)
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toMatch({...data, address: undefined});

      resp = await args.client.singleton('MyProfile')
          .delete()
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedExact(1);
      await expect(() =>
          args.client.singleton('MyProfile')
              .get()
              .toPromise()
      ).rejects.toThrow('404');
    })

  })
}
