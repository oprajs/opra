import { ApiDocument, OpraSchema } from '@opra/common';
import { MailConsumer } from '../../_support/test-msg-api/api/mail-consumer.js';
import { TestMsgApiDocument } from '../../_support/test-msg-api/index.js';

describe('MsgController', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestMsgApiDocument.create();
  });

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(doc.msgApi.findController('unknownResource')).not.toBeDefined();
  });

  it('Should findController(name) return MsgController instance', async () => {
    const res = doc.msgApi.findController('MailConsumer');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should findController(Type) return MsgController instance', async () => {
    const res = doc.msgApi.findController(MailConsumer);
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MailConsumer');
  });

  it('Should toString() return string enumeration', async () => {
    const res = doc.msgApi.findController('MailConsumer');
    expect(res!.toString()).toStrictEqual('[MsgController MailConsumer]');
  });

  it('Should toJSON() return Controller schema', async () => {
    const res = doc.msgApi.findController('MailConsumer')!;
    const sch = res.toJSON();
    expect(sch).toEqual({
      kind: OpraSchema.MsgController.Kind,
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
