import { ApiDocument, OpraSchema } from '@opra/common';
import { expect } from 'expect';
import { MailConsumer } from '../../_support/test-mq-api/api/mail-consumer.js';
import { TestMQApiDocument } from '../../_support/test-mq-api/index.js';

describe('common:MQController', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestMQApiDocument.create();
  });

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(doc.getMqApi().findController('unknownResource')).not.toBeDefined();
  });

  it('Should findController(name) return MQController instance', async () => {
    const res = doc.getMqApi().findController('MailConsumer');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should findController(Type) return MQController instance', async () => {
    const res = doc.getMqApi().findController(MailConsumer);
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should toString() return string enumeration', async () => {
    const res = doc.getMqApi().findController('MailConsumer');
    expect(res!.toString()).toStrictEqual('[MQController MailConsumer]');
  });

  it('Should toJSON() return Controller schema', async () => {
    const res = doc.getMqApi().findController('MailConsumer')!;
    const sch = res.toJSON();
    expect(sch).toEqual({
      kind: OpraSchema.MQController.Kind,
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
