import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator.js';
import { QueryRequestContext } from '@opra/core';
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
      case HandlerParamType.SERVICE:
        return (args[3] as QueryRequestContext).document;
      case HandlerParamType.QUERY:
        return (args[3] as QueryRequestContext).query;
      case HandlerParamType.RESPONSE:
        return (args[3] as QueryRequestContext).response;
      case HandlerParamType.USER_CONTEXT:
        return (args[3] as QueryRequestContext).executionContext.userContext;
      default:
        return null;
    }
  }
}
