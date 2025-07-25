import { ApiDocument, RpcApi, RpcController } from '@opra/common';
import { expect } from 'expect';
import { TestRpcApiDocument } from '../../_support/test-rpc-api/index.js';

describe('common:RpcApi', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestRpcApiDocument.create();
  });

  it('Should create RpcApi instance', async () => {
    const api = doc.api as RpcApi;
    expect(api).toBeDefined();
    expect(api.transport).toEqual('rpc');
    expect(api.platform).toEqual('kafka');
    expect(api.description).toEqual('test service');
  });

  it('Should create controller instances', async () => {
    const api = doc.api as RpcApi;
    expect(api.controllers.size).toBeGreaterThan(0);
    expect(Array.from(api.controllers.keys())).toStrictEqual(['MailConsumer']);
    expect(api.controllers.get('MailConsumer')).toBeInstanceOf(RpcController);
  });
});
