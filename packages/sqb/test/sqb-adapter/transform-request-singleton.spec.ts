/* eslint-disable import/no-duplicates */
import '@opra/sqb';
import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { SQBAdapter } from '@opra/sqb';
import { createTestApp } from '../_support/test-app/index.js';

describe('SQBAdapter.transformRequest (Singleton)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    const app = await createTestApp();
    api = app.api;
  });

  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([data, {}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data,
        params: {
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

  describe('Convert "delete" request', function () {
    it('Should prepare', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'delete'
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });
  });

  describe('Convert "get" request', function () {

    it('Should prepare', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'get'
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'get',
        params: {
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });
  })

  describe('Convert "update" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([data, {}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data,
        params: {
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

});

