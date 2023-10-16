import { OpraTestClient } from '@opra/testing';

export function collectionSearchTests(args: { client: OpraTestClient }) {

  describe('Collection:findMany', function () {

    afterAll(() => global.gc && global.gc());

    it('Should return list object', async () => {
      const resp = await args.client.collection('Customers')
          .findMany()
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toHaveMinItems(1);
    });

    it('Test "limit" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({limit: 3})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toHaveMaxItems(3);
    })

    it('Test "sort" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({sort: ['givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toBeSortedBy('givenName');
    })

    it('Test "skip" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({skip: 10, sort: ['_id']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toHaveMinItems(1);
      expect(resp.body.payload?.[0]._id).toBeGreaterThanOrEqual(10);
    })

    it('Test "pick" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({pick: ['givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toHaveFieldsOnly(['_id', 'givenName']);
    })

    it('Test "omit" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({omit: ['givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .not.toHaveFields(['givenName']);
    })

    it('Test "filter" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({filter: 'gender="M"'})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection()
          .toHaveMinItems(1)
          .toBeFilteredBy('gender="M"');
    })

    it('Test "count" option', async () => {
      const resp = await args.client.collection('Customers')
          .findMany({count: true})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnCollection();
      expect(resp.body.totalMatches).toBeGreaterThanOrEqual(100);
    })

  })
}
