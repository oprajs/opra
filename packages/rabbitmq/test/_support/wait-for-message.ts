import { RabbitmqAdapter, RabbitmqContext } from '@opra/rabbitmq';

const waitList = new Set();

export async function waitForMessage(
  adapter: RabbitmqAdapter,
  oprname: string,
  key: any,
): Promise<RabbitmqContext> {
  return new Promise((resolve, reject) => {
    const waitKey = oprname + ':' + key;
    waitList.add(waitKey);
    const onFinish = async (_ctx: RabbitmqContext) => {
      if (_ctx.__oprDef?.name === oprname) {
        if (_ctx.message.messageId === key) {
          adapter.removeListener('error', onError);
          adapter.removeListener('context-finish', onFinish);
          waitList.delete(waitKey);
          resolve(_ctx);
        } else {
          if (waitList.has(waitKey)) return;

          console.log(
            `Warning: Waiting message with "${key}" key but god message with "${_ctx.message.routingKey}"`,
          );
        }
      } else {
        if (waitList.has(waitKey)) return;

        console.log(
          `Warning: Waiting message for "${oprname}" operation but god message for "${_ctx.__oprDef?.name}"`,
        );
      }
    };
    const onError = (e: any) => {
      waitList.delete(waitKey);
      adapter.removeListener('context-finish', onFinish);
      reject(e);
    };
    adapter.on('context-finish', onFinish);
    adapter.once('error', onError);
  });
}
