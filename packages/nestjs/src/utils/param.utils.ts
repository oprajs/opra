import 'reflect-metadata';
import { PipeTransform, Type } from '@nestjs/common';
import { PARAM_ARGS_METADATA } from '../constants.js';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';

export type ParamData = object | string | number;
export type ParamsMetadata = Record<number,
    {
      index: number;
      data?: ParamData;
    }>;

function assignMetadata(
    args: ParamsMetadata,
    paramType: HandlerParamType,
    index: number,
    data?: ParamData,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return {
    ...args,
    [`${paramType}:${index}`]: {
      index,
      data,
      pipes,
    },
  };
}

export function createOpraParamDecorator(paramType: HandlerParamType): ParameterDecorator {
  return (target, key, index) => {
    if (!key)
      return;
    const args =
        Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {};
    Reflect.defineMetadata(
        PARAM_ARGS_METADATA,
        assignMetadata(args, paramType, index),
        target.constructor,
        key,
    );
  };
}
