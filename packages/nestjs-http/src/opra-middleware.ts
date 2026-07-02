import { Injectable, type NestMiddleware } from '@nestjs/common';
import { HttpRequest, HttpResponse } from '@opra/http';
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
    const request = HttpRequest.create(req);
    const response = HttpResponse.create(res);
    this.opraAdapter
      .createContext(request, response)
      .then(async context => {
        // @ts-ignore
        context.platform = req.route ? 'express' : 'fastify';
        (req as any).opraContext = context;
        await this.opraAdapter
          .emitAsync('createContext', context)
          .then(() => next());
      })
      .catch(next);
  }
}
