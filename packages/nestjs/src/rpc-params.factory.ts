import type { ParamsFactory } from '@nestjs/core/helpers/external-context-creator.js';

/**
 * Factory class that provides parameters for NestJS RPC controllers.
 */
export class RpcParamsFactory implements ParamsFactory {
  /**
   * Exchanges a metadata key for a value from the arguments.
   *
   * @param type - The metadata type.
   * @param data - The metadata data.
   * @param args - The arguments array.
   * @returns The first argument if available, otherwise null.
   */
  exchangeKeyForValue(type: number, data: any, args: any) {
    if (!args) {
      return null;
    }
    args = Array.isArray(args) ? args : [];
    return args[0];
  }
}
