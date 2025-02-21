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
      if (_ctx.operation?.name === oprname) {
        if (_ctx.properties.messageId === key) {
          adapter.removeListener('error', onError);
          adapter.removeListener('after-execute', onMessage);
          waitList.delete(waitKey);
          resolve(_ctx);
        } else {
          if (waitList.has(waitKey)) return;

          console.log(
            `Warning: Waiting message with "${key}" key but god message with "${_ctx.fields.routingKey}"`,
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
      adapter.removeListener('after-execute', onMessage);
      reject(e);
    };
    adapter.on('after-execute', onMessage);
    adapter.once('error', onError);
  });
}
