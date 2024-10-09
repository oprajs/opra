import { KafkaAdapter, KafkaContext } from '@opra/kafka';

export async function waitForMessage(adapter: KafkaAdapter, oprname: string, key: any): Promise<KafkaContext> {
  return new Promise((resolve, reject) => {
    const onMessage = async (_ctx: KafkaContext) => {
      if (_ctx.operation?.name === oprname && _ctx.key === key) {
        adapter.removeListener('error', onError);
        adapter.removeListener('after-execute', onMessage);
        resolve(_ctx);
      }
    };
    const onError = (e: any) => {
      adapter.removeListener('after-execute', onMessage);
      reject(e);
    };
    adapter.on('after-execute', onMessage);
    adapter.once('error', onError);
  });
}
