import { Application, NextFunction, Request, Response, Router } from 'express';
import * as nodePath from 'path';
import { Mutable } from 'ts-gems';
import { ApiDocument, HttpApi, HttpController, NotFoundError } from '@opra/common';
import { kAssetCache, kHandler } from '../constants.js';
import { HttpAdapter } from './http-adapter.js';
import { HttpContext } from './http-context.js';
import { HttpIncoming } from './interfaces/http-incoming.interface.js';
import { HttpOutgoing } from './interfaces/http-outgoing.interface.js';

export class ExpressAdapter extends HttpAdapter {
  readonly app: Application;
  protected _controllers = new Map<HttpController, any>();

  constructor(app: Application, document: ApiDocument, options?: HttpAdapter.Options) {
    super(document, options);
    this.app = app;
    if (!(this.document.api instanceof HttpApi)) throw new TypeError('document.api must be instance of HttpApi');
    (this as Mutable<ExpressAdapter>).api = this.document.api as HttpApi;
    for (const c of this.api.controllers.values()) this._createControllers(c);
    this._initRouter(options?.basePath);
  }

  get platform(): string {
    return 'express';
  }

  async close() {
    const processResource = async (resource: HttpController) => {
      if (resource.controllers.size) {
        const subResources = Array.from(resource.controllers.values());
        subResources.reverse();
        for (const subResource of subResources) {
          await processResource(subResource);
        }
      }
      if (resource.onShutdown) {
        const controller = this._controllers.get(resource) || resource.instance;
        try {
          await resource.onShutdown.call(controller, resource);
        } catch (e) {
          this.logger.error(e);
        }
      }
    };
    for (const c of this.api.controllers.values()) await processResource(c);
    this._controllers.clear();
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllers.get(controller);
  }

  protected _initRouter(basePath?: string) {
    const router = Router();
    if (basePath) {
      if (!basePath.startsWith('/')) basePath = '/' + basePath;
      if (basePath) this.app.use(basePath, router);
    } else this.app.use(router);

    /** Add an endpoint that returns document schema */
    router.get('*', (_req, _res, next) => {
      if (_req.url.includes('/$schema')) {
        const url = (_req.url.includes('?') ? _req.url.substring(0, _req.url.indexOf('?')) : _req.url).toLowerCase();
        if (url === '/$schema') {
          const res = HttpOutgoing.from(_res);
          this[kHandler].sendDocumentSchema(res).catch(next);
          return;
        }
      }
      next();
    });

    /** Add operation endpoints */
    if (this.api.controllers.size) {
      const processResource = (resource: HttpController, currentPath: string) => {
        currentPath = nodePath.join(currentPath, resource.path);
        for (const operation of resource.operations.values()) {
          const routePath = operation.path ? nodePath.join(currentPath, operation.path) : currentPath;
          router[operation.method.toLowerCase()](routePath, (_req: Request, _res: Response, _next) => {
            const request = HttpIncoming.from(_req);
            const response = HttpOutgoing.from(_res);
            const platformArgs = {
              app: this.app,
              router,
              request: _req,
              response: _res,
            };
            const context = new HttpContext({
              adapter: this,
              platform: this.platform,
              request,
              response,
              operation,
              resource: operation.owner,
              platformArgs,
            });

            this[kHandler]
              .handleRequest(context)
              .then(() => {
                if (!_res.headersSent) _next();
              })
              .catch((e: unknown) => this.logger.fatal(e));
          });
        }
        if (resource.controllers.size) {
          for (const child of resource.controllers.values()) processResource(child, currentPath);
        }
      };
      for (const c of this.api.controllers.values()) processResource(c, '/');
    }

    /** Add an endpoint that returns 404 error at last */
    router.use('*', (_req: Request, _res: Response, next: NextFunction) => {
      const res = HttpOutgoing.from(_res);
      // const url = new URL(_req.originalUrl, '')
      this[kHandler]
        .sendErrorResponse(res, [
          new NotFoundError({
            message: `No endpoint found for [${_req.method}]${_req.baseUrl}`,
            details: {
              path: _req.baseUrl,
              method: _req.method,
            },
          }),
        ])
        .catch(next);
    });
  }

  protected _createControllers(resource: HttpController): void {
    let controller: any = resource.instance;
    if (!controller && resource.ctor) controller = new resource.ctor();
    if (controller) {
      if (typeof controller.onInit === 'function') controller.onInit.call(controller, this);
      this._controllers.set(resource, controller);
      for (const operation of resource.operations.values()) {
        const fn = controller[operation.name];
        if (typeof fn === 'function') this[kAssetCache].set(operation, 'handler', fn);
      }
      // Initialize sub resources
      for (const r of resource.controllers.values()) {
        this._createControllers(r);
      }
    }
    return controller;
  }
}
