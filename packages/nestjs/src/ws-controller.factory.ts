import { WS_CONTROLLER_METADATA } from '@opra/common';
import { RpcControllerFactory } from './rpc-controller.factory.js';

export class WSControllerFactory extends RpcControllerFactory {
  protected override _metadataKey = WS_CONTROLLER_METADATA;
}
