import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { HttpContext, HttpIncoming, HttpOutgoing } from '@opra/http';
import type { NextFunction, Request, Response } from 'express';
import { OPRA_HTTP_MODULE_OPTIONS } from '../../constants.js';
import type { OpraHttpModule } from '../opra-http.module.js';
import { OpraHttpNestjsAdapter } from '../opra-http-nestjs-adapter.js';

@Injectable()
export class OpraMiddleware implements NestMiddleware {
  constructor(
    protected opraAdapter: OpraHttpNestjsAdapter,
    @Inject(OPRA_HTTP_MODULE_OPTIONS)
    protected options: OpraHttpModule.Options,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const request = HttpIncoming.from(req);
    const response = HttpOutgoing.from(res);
    /** Create the HttpContext */
    const context = new HttpContext({
      adapter: this.opraAdapter,
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
