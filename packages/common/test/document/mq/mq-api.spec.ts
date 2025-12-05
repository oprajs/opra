import { ApiDocument, MQApi, MQController } from '@opra/common';
import { expect } from 'expect';
import { TestMQApiDocument } from '../../_support/test-mq-api/index.js';

describe('common:MQApi', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestMQApiDocument.create();
  });

  it('Should create MQApi instance', async () => {
    const api = doc.api as MQApi;
    expect(api).toBeDefined();
    expect(api.transport).toEqual('mq');
    expect(api.platform).toEqual('kafka');
    expect(api.description).toEqual('test service');
  });

  it('Should create controller instances', async () => {
    const api = doc.api as MQApi;
    expect(api.controllers.size).toBeGreaterThan(0);
    expect(Array.from(api.controllers.keys())).toStrictEqual(['MailConsumer']);
    expect(api.controllers.get('MailConsumer')).toBeInstanceOf(MQController);
  });
});
