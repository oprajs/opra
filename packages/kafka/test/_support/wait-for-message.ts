import { KafkaAdapter, KafkaContext } from '@opra/kafka';

const waitList = new Set();

export async function waitForMessage(
  adapter: KafkaAdapter,
  oprname: string,
  key: any,
): Promise<KafkaContext> {
  return new Promise((resolve, reject) => {
    const waitKey = oprname + ':' + key;
    waitList.add(waitKey);
    const onMessage = async (_ctx: KafkaContext) => {
      if (_ctx.operation?.name === oprname) {
        if (_ctx.key === key) {
          adapter.removeListener('error', onError);
          adapter.removeListener('finish', onMessage);
          waitList.delete(waitKey);
          resolve(_ctx);
        } else {
          if (waitList.has(waitKey)) return;

          console.log(
            `Warning: Waiting message with "${key}" key but god message with "${_ctx.key}"`,
          );
        }
      } else {
        if (waitList.has(waitKey)) return;

        console.log(
          `Warning: Waiting message for "${oprname}" operation but god message for "${_ctx.operation?.name}"`,
        );
      }
    };
    const onError = (e: any) => {
      waitList.delete(waitKey);
      adapter.removeListener('finish', onMessage);
      reject(e);
    };
    adapter.on('finish', onMessage);
    adapter.once('error', onError);
  });
}
