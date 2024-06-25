import nodePath from 'path';
import {
  Controller,
  Delete,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
  Req,
  Res,
  Search,
  Type,
  UseFilters,
} from '@nestjs/common';
import {
  ApiDocument,
  HTTP_CONTROLLER_METADATA,
  HttpApi,
  HttpController,
  isConstructor,
  NotFoundError,
} from '@opra/common';
import { HttpAdapter, HttpContext } from '@opra/core';
import { asMutable } from 'ts-gems';
import type { OpraHttpModule } from './opra-http.module';
import { OpraExceptionFilter } from './services/opra-exception-filter.js';

export const kHandler = Symbol.for('kHandler');

export class OpraNestAdapter extends HttpAdapter {
  readonly controllers: Type[] = [];

  constructor(options: OpraHttpModule.Options) {
    super(
      (function () {
        const document = new ApiDocument();
        document.api = new HttpApi(document);
        return document;
      })(),
      options,
    );
    let basePath = options.basePath || '/';
    if (!basePath.startsWith('/')) basePath = '/' + basePath;
    if (options.controllers) options.controllers.forEach(c => this._createNestControllers(c, basePath));
  }

  async close() {
    //
  }

  protected _createNestControllers(source: Type, currentPath: string) {
    const metadata: HttpController.Metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, source);
    if (!metadata) return;
    const newClass = {
      [source.name]: class extends source {},
    }[source.name];

    const newPath = metadata.path ? nodePath.join(currentPath, metadata.path) : currentPath;
    const adapter = this;

    /** Inject exception filter */
    UseFilters(new OpraExceptionFilter(adapter))(newClass);

    Controller()(newClass);
    this.controllers.push(newClass);
    if (metadata.operations) {
      for (const [k, v] of Object.entries(metadata.operations)) {
        const operationHandler = source.prototype[k];
        Object.defineProperty(newClass.prototype, k, {
          writable: true,
          /** NestJS handler method */
          async value(this: any, _req: any) {
            const api = adapter.document.api as HttpApi;
            const controller = api.findController(newClass);
            const operation = controller?.operations.get(k);
            const context = asMutable<HttpContext>(_req.opraContext);
            if (!(context && operation && typeof operationHandler === 'function'))
              throw new NotFoundError({
                message: `No endpoint found for [${_req.method}]${_req.baseUrl}`,
                details: {
                  path: _req.baseUrl,
                  method: _req.method,
                },
              });
            /** Configure the HttpContext */
            context.adapter = adapter;
            context.document = adapter.document;
            context.operation = operation;
            context.controller = operation.owner;
            context.controllerInstance = this;
            context.operationHandler = operationHandler;
            /** Handle request */
            await adapter[kHandler].handleRequest(context);
          },
        });

        /** Copy metadata keys from source function to new one */
        const metadataKeys = Reflect.getOwnMetadataKeys(operationHandler);
        const newFn = newClass.prototype[k];
        for (const key of metadataKeys) {
          const m = Reflect.getMetadata(key, operationHandler);
          Reflect.defineMetadata(key, m, newFn);
        }

        Req()(newClass.prototype, k, 0);
        Res()(newClass.prototype, k, 1);

        const descriptor = Object.getOwnPropertyDescriptor(newClass.prototype, k)!;
        const operationPath = newPath + (v.path || '');
        switch (v.method || 'GET') {
          case 'DELETE':
            /** Call @Delete decorator over new property */
            Delete(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'GET':
            /** Call @Get decorator over new property */
            Get(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'HEAD':
            /** Call @Head decorator over new property */
            Head(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'OPTIONS':
            /** Call @Options decorator over new property */
            Options(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'PATCH':
            /** Call @Patch decorator over new property */
            Patch(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'POST':
            /** Call @Post decorator over new property */
            Post(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'PUT':
            /** Call @Put decorator over new property */
            Put(operationPath)(newClass.prototype, k, descriptor);
            break;
          case 'SEARCH':
            /** Call @Search decorator over new property */
            Search(operationPath)(newClass.prototype, k, descriptor);
            break;
        }
      }
    }
    if (metadata.controllers) {
      for (const child of metadata.controllers) {
        if (!isConstructor(child)) throw new TypeError('Controllers should be injectable a class');
        this._createNestControllers(child, newPath);
      }
    }
  }
}
