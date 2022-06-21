import {ParamData} from '@nestjs/common';
import {ParamsFactory} from '@nestjs/core/helpers/external-context-creator';
import {OpraParamType} from '../enums/opra-paramtype.enum';

export class OpraParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number,  args: any, data?: ParamData) {
    if (!args) {
      return null;
    }
    args = Array.isArray(args) ? args : [];
    switch (type as OpraParamType) {
      case OpraParamType.CONTEXT:
        return args[0];
      case OpraParamType.ARGS:
        return data && args[1] ? args[1][data as string] : args[1];
      default:
        return null;
    }
  }
}
