import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { MailConsumer } from '../../_support/test-mq-api/api/mail-consumer.js';
import { TestMQApiDocument } from '../../_support/test-mq-api/index.js';

describe('common:MQOperation', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestMQApiDocument.create();
  });

  it('Should findController(Type) return MQController instance', async () => {
    const opr = doc.mqApi.findOperation(MailConsumer, 'sendMail');
    expect(opr).toBeDefined();
  });

  it('Should toJSON() return operation schema', async () => {
    const opr = doc.mqApi.findOperation(MailConsumer, 'sendMail3')!;
    expect(opr).toBeDefined();
    const sch = opr.toJSON();
    expect(sch).toEqual({
      kind: 'MQOperation',
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
