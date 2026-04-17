import { WS_CONTROLLER_METADATA } from '@opra/common';
import { RpcControllerFactory } from './rpc-controller.factory.js';

/**
 * Factory class that wraps Opra WebSocket controllers into NestJS controllers.
 */
export class WSControllerFactory extends RpcControllerFactory {
  protected override _metadataKey = WS_CONTROLLER_METADATA;
}
