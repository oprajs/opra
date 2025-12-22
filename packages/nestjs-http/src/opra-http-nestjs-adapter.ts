import nodePath from 'node:path';
import { isConstructor } from '@jsopen/objects';
import {
  Controller,
  Delete,
  Get,
  Head,
  Next,
  Options,
  Patch,
  Post,
  Put,
  Req,
  Res,
  Search,
  type Type,
} from '@nestjs/common';
import {
  HTTP_CONTROLLER_METADATA,
  HttpApi,
  HttpController,
  NotFoundError,
} from '@opra/common';
import { HttpAdapter, HttpContext } from '@opra/http';
import { OpraNestUtils, Public } from '@opra/nestjs';
import { asMutable } from 'ts-gems';

export class OpraHttpNestjsAdapter extends HttpAdapter {
  readonly nestControllers: Type[] = [];

  constructor(
    options: HttpAdapter.Options & {
      schemaIsPublic?: boolean;
      controllers?: Type[];
    },
  ) {
    super(options);
    this._addRootController(options.schemaIsPublic);
    if (options.controllers) {
      for (const c of options.controllers) {
        this._addToNestControllers(c, this.basePath, []);
      }
    }
  }

  async close() {
    //
  }

  protected _addRootController(isPublic?: boolean) {
    const _this = this;

    @Controller({
      path: this.basePath,
    })
    class RootController {
      @Get('/\\$schema')
      schema(@Req() _req: any, @Next() next: Function) {
        _this.handler.sendDocumentSchema(_req.opraContext).catch(() => next());
      }
    }

    if (isPublic) {
      Public()(
        RootController.prototype,
        'schema',
        Object.getOwnPropertyDescriptor(RootController.prototype, 'schema')!,
      );
    }

    this.nestControllers.push(RootController);
  }

  protected _addToNestControllers(
    sourceClass: Type,
    currentPath: string,
    parentTree: Type[],
  ) {
    const metadata: HttpController.Metadata = Reflect.getMetadata(
      HTTP_CONTROLLER_METADATA,
      sourceClass,
    );
    if (!metadata) return;
    /** Create a new controller class */
    const newClass = {
      [sourceClass.name]: class extends sourceClass {},
    }[sourceClass.name];
    /** Copy metadata keys from source class to new one */
    OpraNestUtils.copyDecoratorMetadata(newClass, ...parentTree);
    Controller()(newClass);

    const newPath = metadata.path
      ? nodePath.posix.join(currentPath, metadata.path)
      : currentPath;
    const adapter = this;
    // adapter.logger =
    /** Disable default error handler. Errors will be handled by OpraExceptionFilter */
    adapter.handler.onError = (context, error) => {
      throw error;
    };

    this.nestControllers.push(newClass);
    let metadataKeys: any[];
    if (metadata.operations) {
      for (const [k, v] of Object.entries(metadata.operations)) {
        const operationHandler = sourceClass.prototype[k];
        Object.defineProperty(newClass.prototype, k, {
          writable: true,
          /** NestJS handler method */
          async value(this: any, _req: any, _res) {
            _res.statusCode = 200;
            const api = adapter.document.api as HttpApi;
            const controller = api.findController(sourceClass);
            const operation = controller?.operations.get(k);
            const context = asMutable<HttpContext>(_req.opraContext);
            if (
              !(context && operation && typeof operationHandler === 'function')
            ) {
              throw new NotFoundError({
                message: `No endpoint found for [${_req.method}]${_req.baseUrl}`,
                details: {
                  path: _req.baseUrl,
                  method: _req.method,
                },
              });
            }
            /** Configure the HttpContext */
            context.__docNode = operation.node;
            context.__oprDef = operation;
            context.__contDef = operation.owner;
            context.__controller = this;
            context.__handler = operationHandler;
            /** Handle request */
            await adapter.handler.handleRequest(context);
          },
        });

        /** Copy metadata keys from source function to new one */
        metadataKeys = Reflect.getOwnMetadataKeys(operationHandler);
        const newFn = newClass.prototype[k];
        for (const key of metadataKeys) {
          const m = Reflect.getMetadata(key, operationHandler);
          Reflect.defineMetadata(key, m, newFn);
        }

        Req()(newClass.prototype, k, 0);
        Res()(newClass.prototype, k, 1);

        const descriptor = Object.getOwnPropertyDescriptor(
          newClass.prototype,
          k,
        )!;
        const operationPath = v.mergePath
          ? newPath + (v.path || '')
          : nodePath.posix.join(newPath, v.path || '');
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
          default:
            break;
        }
      }
    }
    if (metadata.controllers) {
      for (const child of metadata.controllers) {
        if (!isConstructor(child))
          throw new TypeError('Controllers should be injectable a class');
        this._addToNestControllers(child, newPath, [
          ...parentTree,
          sourceClass,
        ]);
      }
    }
  }
}
