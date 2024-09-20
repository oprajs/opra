import { ApiDocument } from '@opra/common';
import { MailConsumer } from '../../_support/test-msg-api/api/mail-consumer.js';
import { TestMsgApiDocument } from '../../_support/test-msg-api/index.js';

describe('MsgOperation', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestMsgApiDocument.create();
  });

  it('Should findController(Type) return MsgController instance', async () => {
    const opr = doc.msgApi.findOperation(MailConsumer, 'sendMail');
    expect(opr).toBeDefined();
  });

  it('Should toJSON() return operation schema', async () => {
    const opr = doc.msgApi.findOperation(MailConsumer, 'sendMail3')!;
    expect(opr).toBeDefined();
    const sch = opr.toJSON();
    expect(sch).toEqual({
      kind: 'MsgOperation',
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
