import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { createOpraParamDecorator } from '../utils/param.utils.js';

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `RequestContext`.
 */
export const Context = createOpraParamDecorator(HandlerParamType.CONTEXT);

/**
 * Handler method parameter decorator. Populates the decorated
 * parameter with the value of `OpraService`.
 */
export const ApiDoc = createOpraParamDecorator(HandlerParamType.API);
