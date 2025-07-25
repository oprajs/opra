import { ApiDocument, OpraSchema } from '@opra/common';
import { expect } from 'expect';
import { MailConsumer } from '../../_support/test-rpc-api/api/mail-consumer.js';
import { TestRpcApiDocument } from '../../_support/test-rpc-api/index.js';

describe('common:RpcController', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestRpcApiDocument.create();
  });

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(doc.rpcApi.findController('unknownResource')).not.toBeDefined();
  });

  it('Should findController(name) return RpcController instance', async () => {
    const res = doc.rpcApi.findController('MailConsumer');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should findController(Type) return RpcController instance', async () => {
    const res = doc.rpcApi.findController(MailConsumer);
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should toString() return string enumeration', async () => {
    const res = doc.rpcApi.findController('MailConsumer');
    expect(res!.toString()).toStrictEqual('[RpcController MailConsumer]');
  });

  it('Should toJSON() return Controller schema', async () => {
    const res = doc.rpcApi.findController('MailConsumer')!;
    const sch = res.toJSON();
    expect(sch).toEqual({
      kind: OpraSchema.RpcController.Kind,
      description: 'Mail consumer controller',
      headers: [
        {
          name: 'access-token',
          type: 'string',
        },
      ],
      operations: expect.any(Object),
    });
  });
});
