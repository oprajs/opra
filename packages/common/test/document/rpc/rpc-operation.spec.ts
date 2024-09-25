import { ApiDocument } from '@opra/common';
import { MailConsumer } from '../../_support/test-rpc-api/api/mail-consumer.js';
import { TestRpcApiDocument } from '../../_support/test-rpc-api/index.js';

describe('RpcOperation', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestRpcApiDocument.create();
  });

  it('Should findController(Type) return RpcController instance', async () => {
    const opr = doc.RpcApi.findOperation(MailConsumer, 'sendMail');
    expect(opr).toBeDefined();
  });

  it('Should toJSON() return operation schema', async () => {
    const opr = doc.RpcApi.findOperation(MailConsumer, 'sendMail3')!;
    expect(opr).toBeDefined();
    const sch = opr.toJSON();
    expect(sch).toEqual({
      kind: 'RpcOperation',
      channel: 'send-email',
      payloadType: 'SendMailDto',
      keyType: 'uuid',
      headers: [
        {
          name: 'header2',
          type: 'integer',
        },
      ],
      response: {
        channel: 'send-email-response',
        payloadType: 'string',
        headers: [
          {
            name: 'access-token',
            type: 'string',
          },
        ],
      },
    });
  });
});
