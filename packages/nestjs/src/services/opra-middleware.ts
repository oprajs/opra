import type { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { HttpContext, HttpIncoming, HttpOutgoing } from '@opra/core';

@Injectable()
export class OpraMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const request = HttpIncoming.from(req);
    const response = HttpOutgoing.from(res);
    /** Create the HttpContext */
    (req as any).opraContext = new HttpContext({
      adapter: {} as any,
      platform: req.route ? 'express' : 'fastify',
      request,
      response,
    });
    next();
  }
}
