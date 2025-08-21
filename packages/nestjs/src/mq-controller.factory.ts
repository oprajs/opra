import { MQ_CONTROLLER_METADATA } from '@opra/common';
import { RpcControllerFactory } from './rpc-controller.factory.js';

export class MQControllerFactory extends RpcControllerFactory {
  protected override _metadataKey = MQ_CONTROLLER_METADATA;
}
