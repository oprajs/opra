import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { createOpraParamDecorator } from '../utils/param.utils.js';

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `QueryContext`.
 */
export const Context = createOpraParamDecorator(HandlerParamType.CONTEXT);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `QueryResponse`.
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

