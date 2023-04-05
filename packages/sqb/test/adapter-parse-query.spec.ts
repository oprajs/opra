import { ApiDocument } from '@opra/common';
import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery,
  CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery
} from '@opra/core';
import { OperatorType, SerializationType } from '@sqb/builder';
import { SQBAdapter } from '../src/index.js';
import { createApp } from './_support/app/index.js';

describe('SQBAdapter.parseQuery', function () {
  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createApp()).document;
  })

  describe('CollectionCreateQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollection('Customers'), values);
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollection('Customers'), values, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare "omit" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollection('Customers'), values, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare "include" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollection('Customers'), values, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
    });
  });


  describe('CollectionDeleteQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionDeleteQuery(api.getCollection('Customers'), 1);
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
    });

  });

  describe('CollectionDeleteManyQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionDeleteManyQuery(api.getCollection('Customers'));
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const query = new CollectionDeleteManyQuery(api.getCollection('Customers'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });


  describe('CollectionGetQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionGetQuery(api.getCollection('Customers'), 1);
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
    });

    it('Should prepare with "pick" option', async () => {
      const query = new CollectionGetQuery(api.getCollection('Customers'), 1, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const query = new CollectionGetQuery(api.getCollection('Customers'), 1, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "include" option', async () => {
      const query = new CollectionGetQuery(api.getCollection('Customers'), 1, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
    });
  });

  describe('CollectionSearchQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'));
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({});
    })

    it('Should prepare "limit" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {limit: 5});
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({limit: 5});
    })

    it('Should prepare "offset" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {skip: 5});
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({offset: 5});
    });

    it('Should prepare "distinct" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {distinct: true});
      const o = SQBAdapter.parseQuery(query);
      expect(o.options).toStrictEqual({distinct: true});
    })

    it('Should prepare "total" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {count: true});
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({total: true});
    });

    it('Should prepare with "pick" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({pick: ['id', 'givenName', 'country.name']});
    });

    it('Should prepare with "omit" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({omit: ['id', 'givenName', 'country.name']});
    });

    it('Should prepare with "include" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toStrictEqual({include: ['id', 'givenName', 'country.name']});
    });

    it('Should prepare with "filter" option', async () => {
      const query = new CollectionSearchQuery(api.getCollection('Customers'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options.filter).toBeDefined();
    });
  });

  describe('CollectionUpdateQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getCollection('Customers'), 1, values);
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.keyValue).toStrictEqual(1);
      expect(o.data).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getCollection('Customers'), 1, values, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getCollection('Customers'), 1, values, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getCollection('Customers'), 1, values, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
    });

  });

  describe('CollectionUpdateManyQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateManyQuery(api.getCollection('Customers'), values);
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateManyQuery(api.getCollection('Customers'), values, {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.parseQuery(query);
      expect(o.method).toStrictEqual(query.method);
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

});

