import * as nodePath from 'node:path';
import {
  ApiDocument,
  HttpApi,
  HttpController,
  HttpOperation,
  NotFoundError,
} from '@opra/common';
import {
  type Application,
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { HttpAdapter } from './http-adapter.js';
import { HttpContext } from './http-context.js';
import { HttpIncoming } from './interfaces/http-incoming.interface.js';
import { HttpOutgoing } from './interfaces/http-outgoing.interface.js';

export class ExpressAdapter extends HttpAdapter {
  readonly app: Application;
  protected _controllerInstances = new Map<HttpController, any>();

  constructor(app: Application, options?: HttpAdapter.Options) {
    super(options);
    this.app = app;
  }

  get platform(): string {
    return 'express';
  }

  initialize(document: ApiDocument) {
    if (this._document)
      throw new TypeError(`${this.constructor.name} already initialized.`);
    if (!(document.api instanceof HttpApi))
      throw new TypeError(`The document does not expose an HTTP Api`);
    this._document = document;
    for (const c of this.api.controllers.values()) this._createControllers(c);
    this._initRouter();
  }

  async close() {
    const processInstance = async (controller: HttpController) => {
      if (controller.controllers.size) {
        const subResources = Array.from(controller.controllers.values());
        subResources.reverse();
        for (const subResource of subResources) {
          await processInstance(subResource);
        }
      }
    };
    for (const c of this.api.controllers.values()) await processInstance(c);
    this._controllerInstances.clear();
  }

  getControllerInstance<T>(controllerPath: string): T | undefined {
    const controller = this.api.findController(controllerPath);
    return controller && this._controllerInstances.get(controller);
  }

  protected _initRouter() {
    const router = Router();
    this.app.use(this.basePath, router);

    const createContext = async (
      _req: Request,
      _res: Response,
      args?: {
        controller?: HttpController;
        controllerInstance?: any;
        operation?: HttpOperation;
        operationHandler: Function;
      },
    ): Promise<HttpContext> => {
      const request = HttpIncoming.from(_req);
      const response = HttpOutgoing.from(_res);
      const ctx = new HttpContext({
        adapter: this,
        platform: this.platform,
        request,
        response,
        controller: args?.controller,
        controllerInstance: args?.controllerInstance,
        operation: args?.operation,
        operationHandler: args?.operationHandler,
      });
      await this.emitAsync('createContext', ctx);
      return ctx;
    };

    /** Add an endpoint that returns document schema */
    router.get('/\\$schema', (_req, _res, next) => {
      createContext(_req, _res)
        .then(ctx => this.handler.sendDocumentSchema(ctx).catch(next))
        .catch(next);
    });

    /** Add operation endpoints */
    if (this.api.controllers.size) {
      const processResource = (
        controller: HttpController,
        currentPath: string,
      ) => {
        currentPath = nodePath.join(currentPath, controller.path);
        for (const operation of controller.operations.values()) {
          const routePath = currentPath + (operation.path || '');
          const controllerInstance = this._controllerInstances.get(controller);
          const operationHandler = controllerInstance[operation.name];
          if (!operationHandler) continue;
          /** Define router callback */
          router[operation.method.toLowerCase()](
            routePath,
            (_req: Request, _res: Response, _next: NextFunction) => {
              createContext(_req, _res, {
                controller,
                controllerInstance,
                operation,
                operationHandler,
              })
                .then(ctx => this.handler.handleRequest(ctx))
                .then(() => {
                  if (!_res.headersSent) _next();
                })
                .catch((e: unknown) => this.emit('error', e));
            },
          );
        }
        if (controller.controllers.size) {
          for (const child of controller.controllers.values())
            processResource(child, currentPath);
        }
      };
      for (const c of this.api.controllers.values()) processResource(c, '/');
    }

    /** Add an endpoint that returns 404 error at last */
    router.use(
      '/{*splat}',
      (_req: Request, _res: Response, next: NextFunction) => {
        createContext(_req, _res)
          .then(ctx => {
            ctx.errors.push(
              new NotFoundError({
                message: `No endpoint found at [${_req.method}]${_req.baseUrl}`,
                details: {
                  path: _req.baseUrl,
                  method: _req.method,
                },
              }),
            );
            this.handler.sendResponse(ctx).catch(next);
          })
          .catch(next);
      },
    );
  }

  protected _createControllers(controller: HttpController): void {
    let instance = controller.instance;
    if (!instance && controller.ctor) instance = new controller.ctor();
    if (instance) {
      this._controllerInstances.set(controller, instance);
      // Initialize sub resources
      for (const r of controller.controllers.values()) {
        this._createControllers(r);
      }
    }
    return instance;
  }
}
