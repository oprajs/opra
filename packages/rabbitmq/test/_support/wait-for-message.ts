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
    const onMessage = async (_ctx: RabbitmqContext) => {
      if (_ctx.__oprDef?.name === oprname) {
        if (_ctx.message.messageId === key) {
          adapter.removeListener('error', onError);
          adapter.removeListener('finish', onMessage);
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
      adapter.removeListener('finish', onMessage);
      reject(e);
    };
    adapter.on('finish', onMessage);
    adapter.once('error', onError);
  });
}
