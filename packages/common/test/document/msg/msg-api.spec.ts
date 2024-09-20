import { ApiDocument, MsgApi, MsgController } from '@opra/common';
import { TestMsgApiDocument } from '../../_support/test-msg-api/index.js';

describe('MsgApi', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestMsgApiDocument.create();
  });

  it('Should create MsgApi instance', async () => {
    const api = doc.api as MsgApi;
    expect(api).toBeDefined();
    expect(api.transport).toEqual('msg');
    expect(api.platform).toEqual('kafka');
    expect(api.description).toEqual('test service');
  });

  it('Should create controller instances', async () => {
    const api = doc.api as MsgApi;
    expect(api.controllers.size).toBeGreaterThan(0);
    expect(Array.from(api.controllers.keys())).toStrictEqual(['MailConsumer']);
    expect(api.controllers.get('MailConsumer')).toBeInstanceOf(MsgController);
  });
});
