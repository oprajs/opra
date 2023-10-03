import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function singletonGetTests(args: { client: OpraTestClient }) {

  describe('Singleton:get', function () {
    const data = {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }

    it('Should return error code if resource not found', async () => {
      await args.client.singleton('MyProfile')
          .delete()
          .toPromise();
      await expect(() => args.client.singleton('MyProfile')
          .get()
          .toPromise()
      ).rejects.toThrow('404');
    });

    it('Should return object', async () => {
      await args.client.singleton('MyProfile')
          .create(data)
          .toPromise();

      const resp = await args.client.singleton('MyProfile')
          .get()
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...data, address: undefined})
    });


    it('Should not fetch exclusive fields (unless not included for resolver)', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get()
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['address', 'notes']);
    })

    it('Should pick fields to be returned', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({pick: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({omit: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const resp = await args.client.singleton('MyProfile')
          .get({include: ['address']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['address']);
      expect(resp.body.data.address).toBeDefined();
    })

  })
}
