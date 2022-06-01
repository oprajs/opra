import {map, Observable} from 'rxjs';
import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {joinPath, normalizePath, OpraURL} from '@opra/url';
import {RequestNode as _Request} from '../common/request-node.js';
import {CONTROLLER_METADATA, ENTITY_METHOD_METADATA} from '../constants.js';
import {ControllerMetadata, ControllerMethodMetadata} from '../decorators/types.js';
import {OPRA_MODULE_OPTIONS} from './opra.constants';
import {OpraModuleOptions} from './opra.interface';

declare global {
  namespace Express {
    interface Request {
      opraRequest: _Request;
    }
  }
}

@Injectable()
export class OpraInterceptor implements NestInterceptor {
  globalPrefix: string;
  moduleOptions: OpraModuleOptions;
  servicePrefix: string;

  constructor(@Inject(OPRA_MODULE_OPTIONS) private options: OpraModuleOptions,
              private moduleRef: ModuleRef) {
  }

  async intercept(executionContext: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = executionContext.getHandler();
    const ctor = executionContext.getClass();
    const propertyName = handler.name;
    // Check if handler is owned by Opra
    const methodMetadata: ControllerMethodMetadata =
      Reflect.getMetadata(ENTITY_METHOD_METADATA, ctor.prototype, propertyName);

    // Apply default handler if not
    if (!methodMetadata || executionContext.getType() !== 'http')
      return next.handle();

    /* Handle request if so */
    if (!this.moduleOptions) {
      try {
        this.moduleOptions = await this.moduleRef.resolve(OPRA_MODULE_OPTIONS);
      } catch {
        // ignored
      }
      if (!this.moduleOptions)
        throw new Error('OpraModule must be registered');
    }

    // todo
    const context = this.moduleOptions.context ?
      (typeof this.moduleOptions.context === 'function'
        ? await this.moduleOptions.context(executionContext)
        : this.moduleOptions.context) : undefined;

    const req = executionContext.switchToHttp().getRequest();
    if (this.globalPrefix === undefined) {
      let globalPrefix = (this.moduleRef as any).container._applicationConfig.globalPrefix || '';
      if (globalPrefix && !globalPrefix.startsWith('/'))
        globalPrefix = '/' + globalPrefix;
      while (globalPrefix.endsWith('/'))
        globalPrefix = globalPrefix.substring(0, globalPrefix.length - 1);
      this.globalPrefix = globalPrefix || '';
    }

    if (!this.servicePrefix)
      this.servicePrefix = '/' + normalizePath(
        joinPath(this.globalPrefix, this.moduleOptions.servicePrefix || ''), true);

    const _ctor = executionContext.getClass();
    const controllerMeta: ControllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, _ctor);
    /* istanbul ignore next */
    if (!controllerMeta)
      throw new Error('The controller must be decorated with api.Collection() to access Opra Request');

    // Convert url to RequestNode
    const url = new OpraURL(req.url, this.servicePrefix);
    req.opraRequest = new _Request({
      url,
      executionContext,
      context,
      queryParams: url.searchParams,
      entity: controllerMeta.entity,
      resource: url.path.getResource(0) || '',
      resourceKey: url.path.getKey(0)
    });

    return next.handle().pipe(map(data => handleResponse(data, controllerMeta, methodMetadata)));
  }
}

function handleResponse(
  data: any,
  controllerMeta: ControllerMetadata,
  methodMetadata: ControllerMethodMetadata,
): any {
  if (methodMetadata.method === 'list') {
    if (Array.isArray(data))
      return {
        type: 'Collection',
        collection: controllerMeta.resourceName,
        found: data.length,
        items: data
      }
    data.items = Array.isArray(data.items) ? data.items : [];
    return {
      type: 'Entity',
      collection: controllerMeta.resourceName,
      found: data.items.length,
      ...data
    }
  }
  return {
    entity: controllerMeta.resourceName,
    data
  }
}
