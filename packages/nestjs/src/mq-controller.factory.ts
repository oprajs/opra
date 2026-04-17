import { MQ_CONTROLLER_METADATA } from '@opra/common';
import { RpcControllerFactory } from './rpc-controller.factory.js';

/**
 * Factory class that wraps Opra Message Queue controllers into NestJS controllers.
 */
export class MQControllerFactory extends RpcControllerFactory {
  protected override _metadataKey = MQ_CONTROLLER_METADATA;
}
