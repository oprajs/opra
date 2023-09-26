import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator.js';
import * as opraCore from '@opra/core';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';

export class OpraParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: any, args: any) {
    if (!args) {
      return null;
    }
    args = Array.isArray(args) ? args : [];
    switch (type as HandlerParamType) {
      case HandlerParamType.CONTEXT:
        return args[3];
      case HandlerParamType.REQUEST:
        return (args[3] as opraCore.RequestContext).request;
      case HandlerParamType.RESPONSE:
        return (args[3] as opraCore.RequestContext).response;
      default:
        return null;
    }
  }
}
