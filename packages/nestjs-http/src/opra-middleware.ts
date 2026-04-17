import { Injectable, type NestMiddleware } from '@nestjs/common';
import { HttpContext, HttpIncoming, HttpOutgoing } from '@opra/http';
import type { NextFunction, Request, Response } from 'express';
import { OpraHttpNestjsAdapter } from './opra-http-nestjs-adapter.js';

/**
 * OpraMiddleware
 *
 * NestJS middleware that creates an OPRA context (HttpContext) for each HTTP request
 * and adds it to the request.
 */
@Injectable()
export class OpraMiddleware implements NestMiddleware {
  constructor(protected opraAdapter: OpraHttpNestjsAdapter) {}

  /**
   * Processes requests and creates the OPRA context.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Function that calls the next middleware.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const request = HttpIncoming.from(req);
    const response = HttpOutgoing.from(res);
    /* Create the HttpContext */
    const context = new HttpContext({
      __adapter: this.opraAdapter,
      platform: req.route ? 'express' : 'fastify',
      request,
      response,
    });
    (req as any).opraContext = context;
    this.opraAdapter
      .emitAsync('createContext', context)
      .then(() => next())
      .catch(next);
  }
}
