import type { ParamsFactory } from '@nestjs/core/helpers/external-context-creator.js';

export class RpcParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: any, args: any) {
    if (!args) {
      return null;
    }
    args = Array.isArray(args) ? args : [];
    return args[0];
  }
}
