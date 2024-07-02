import { ApiDocument, HttpApi, HttpController, HttpOperation, NotFoundError } from '@opra/common';
import { Application, NextFunction, Request, Response, Router } from 'express';
import * as nodePath from 'path';
import { kHandler } from '../constants.js';
import { HttpAdapter } from './http-adapter.js';
import { HttpContext } from './http-context.js';
import { HttpIncoming } from './interfaces/http-incoming.interface.js';
import { HttpOutgoing } from './interfaces/http-outgoing.interface.js';

export class ExpressAdapter extends HttpAdapter {
  readonly app: Application;
  protected _controllerInstances = new Map<HttpController, any>();

  constructor(app: Application, document: ApiDocument, options?: HttpAdapter.Options) {
    super(document, options);
    this.app = app;
    if (!(this.document.api instanceof HttpApi)) throw new TypeError('document.api must be instance of HttpApi');
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
        const instance = this._controllerInstances.get(resource) || resource.instance;
        if (instance) {
          try {
            await resource.onShutdown.call(instance, resource);
          } catch (e) {
            this.logger.error(e);
          }
        }
      }
    };
    for (const c of this.api.controllers.values()) await processResource(c);
    this._controllerInstances.clear();
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }

  protected _initRouter(basePath?: string) {
    const router = Router();
    if (basePath) {
      if (!basePath.startsWith('/')) basePath = '/' + basePath;
      if (basePath) this.app.use(basePath, router);
    } else this.app.use(router);

    const createContext = (
      _req: Request,
      _res: Response,
      args?: {
        controller?: HttpController;
        controllerInstance?: any;
        operation?: HttpOperation;
        operationHandler: Function;
      },
    ): HttpContext => {
      const request = HttpIncoming.from(_req);
      const response = HttpOutgoing.from(_res);
      return new HttpContext({
        adapter: this,
        platform: this.platform,
        request,
        response,
        controller: args?.controller,
        controllerInstance: args?.controllerInstance,
        operation: args?.operation,
        operationHandler: args?.operationHandler,
      });
    };

    /** Add an endpoint that returns document schema */
    router.get('/\\$schema', (_req, _res, next) => {
      const context = createContext(_req, _res);
      this[kHandler].sendDocumentSchema(context).catch(next);
    });

    /** Add operation endpoints */
    if (this.api.controllers.size) {
      const processResource = (controller: HttpController, currentPath: string) => {
        currentPath = nodePath.join(currentPath, controller.path);
        for (const operation of controller.operations.values()) {
          const routePath = currentPath + (operation.path || '');
          const controllerInstance = this._controllerInstances.get(controller);
          const operationHandler = controllerInstance[operation.name];
          if (!operationHandler) continue;
          /** Define router callback */
          router[operation.method.toLowerCase()](routePath, (_req: Request, _res: Response, _next: NextFunction) => {
            const context = createContext(_req, _res, {
              controller,
              controllerInstance,
              operation,
              operationHandler,
            });
            this[kHandler]
              .handleRequest(context)
              .then(() => {
                if (!_res.headersSent) _next();
              })
              .catch((e: unknown) => this.logger.fatal(e));
          });
        }
        if (controller.controllers.size) {
          for (const child of controller.controllers.values()) processResource(child, currentPath);
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

  protected _createControllers(controller: HttpController): void {
    let instance = controller.instance;
    if (!instance && controller.ctor) instance = new controller.ctor();
    if (instance) {
      if (typeof instance.onInit === 'function') instance.onInit.call(instance, this);
      this._controllerInstances.set(controller, instance);
      // Initialize sub resources
      for (const r of controller.controllers.values()) {
        this._createControllers(r);
      }
    }
    return instance;
  }
}
