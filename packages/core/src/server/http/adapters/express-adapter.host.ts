import { Application, NextFunction, Request, Response, Router } from 'express';
import * as nodePath from 'path';
import { ApiDocument, HttpController, NotFoundError } from '@opra/common';
import { HttpAdapterHost } from '../http-adapter-host.js';
import { HttpIncoming } from '../interfaces/http-incoming.interface.js';
import { HttpOutgoing } from '../interfaces/http-outgoing.interface.js';
import type { ExpressAdapter } from './express-adapter.js';

export class ExpressAdapterHost extends HttpAdapterHost implements ExpressAdapter {
  protected _platform: string = 'express';
  protected _app: Application;

  constructor(app: Application) {
    super();
    this._app = app;
  }

  get app() {
    return this._app;
  }

  async init(document: ApiDocument, options?: ExpressAdapter.Options) {
    await super.init(document, options);
    const router = Router();
    const basePath = options?.basePath
      ? options.basePath.startsWith('/')
        ? options.basePath
        : '/' + options.basePath
      : undefined;
    if (basePath) this._app.use(basePath, router);
    else this._app.use(router);

    /** Add an endpoint that returns document schema */
    router.get('*', (_req, _res, next) => {
      if (_req.url.includes('/$schema')) {
        const url = (_req.url.includes('?') ? _req.url.substring(0, _req.url.indexOf('?')) : _req.url).toLowerCase();
        if (url === '/$schema') {
          const res = HttpOutgoing.from(_res);
          this._sendDocumentSchema(res).catch(next);
          return;
        }
      }
      next();
    });

    /** Add operation endpoints */
    if (document.api?.root) {
      const processResource = (resource: HttpController, currentPath: string) => {
        currentPath = nodePath.join(currentPath, resource.isRoot ? '' : resource.path || resource.name);
        for (const operation of resource.operations.values()) {
          const routePath = operation.path ? nodePath.join(currentPath, operation.path) : currentPath;
          router[operation.method.toLowerCase()](routePath, (_req: Request, _res: Response, _next) => {
            const req = HttpIncoming.from(_req);
            const res = HttpOutgoing.from(_res);
            this.handleOperation(operation, req, res, {
              app: this.app,
              router,
              request: req,
              response: res,
            })
              .then(() => {
                if (!_res.headersSent) _next();
              })
              .catch(e => this._logger.fatal(e));
          });
        }
        if (resource.children.size) {
          for (const child of resource.children.values()) processResource(child, currentPath);
        }
      };
      processResource(document.api.root, '/');
    }

    /** Add an endpoint that returns 404 error at last */
    router.use('*', (_req: Request, _res: Response, next: NextFunction) => {
      const res = HttpOutgoing.from(_res);
      // const url = new URL(_req.originalUrl, '')
      this._sendErrorResponse(res, [
        new NotFoundError({
          message: `No endpoint found for [${_req.method}]${_req.baseUrl}`,
          details: {
            path: _req.baseUrl,
            method: _req.method,
          },
        }),
      ]).catch(next);
    });
  }

  static async create(app: Application, api: ApiDocument, options?: ExpressAdapter.Options): Promise<ExpressAdapter> {
    if (!app) throw new TypeError('You must provide "app" argument');
    if (!app) throw new TypeError('You must provide "api" argument');
    const adapter = new ExpressAdapterHost(app);
    await adapter.init(api, options);
    return adapter;
  }
}
