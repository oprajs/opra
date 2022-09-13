import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { createOpraParamDecorator } from '../utils/param.utils.js';

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `ExecutionContext`.
 */
export const Context = createOpraParamDecorator(HandlerParamType.CONTEXT);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `ExecutionRequest`.
 */
export const Request = createOpraParamDecorator(HandlerParamType.REQUEST);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `ExecutionResponse`.
 */
export const Response = createOpraParamDecorator(HandlerParamType.RESPONSE);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `OpraService`.
 */
export const Service = createOpraParamDecorator(HandlerParamType.SERVICE);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `OpraService`.
 */
export const Query = createOpraParamDecorator(HandlerParamType.QUERY);

