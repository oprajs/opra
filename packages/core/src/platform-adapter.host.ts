import path from 'path';
import { pascalCase } from 'putil-varhelpers';
import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ApiDocument,
  Container, CrudResource,
  Endpoint,
  ForbiddenError,
  getStackFileName,
  I18n,
  Resource,
  translate
} from '@opra/common';
import { ExecutionContext } from './execution-context.js';
import { Interceptor } from './interfaces/interceptor.interface.js';
import type { PlatformAdapter, Protocol } from './platform-adapter.js';
import { Logger } from './services/logger.js';

const resourceInitialized = Symbol.for('opra.resource.initialized');

/**
 * @class PlatformAdapterHost
 */
export abstract class PlatformAdapterHost extends AsyncEventEmitter implements PlatformAdapter {
  protected _api: ApiDocument;
  protected _controllers = new Map<Resource, any>();
  protected _protocol: Protocol;
  protected _platform: string;
  protected _serviceName: string;
  protected _i18n: I18n;
  protected _logger: Logger;
  protected _interceptors: Interceptor[];

  get api(): ApiDocument {
    return this._api;
  }

  get platform(): string {
    return this._platform;
  }

  get protocol(): Protocol {
    return this._protocol;
  }

  get serviceName(): string {
    return this._serviceName;
  }

  get i18n(): I18n {
    return this._i18n;
  }

  async close() {
    const promises: Promise<void>[] = [];
    for (const r of this._controllers.values()) {
      const onShutdown = r?.onShutdown;
      if (onShutdown)
        promises.push((async () => onShutdown.call(r.controller, r))());
    }
    await Promise.allSettled(promises);
    this._controllers.clear();
  }

  /**
   * Initializes the adapter
   */
  protected async init(api: ApiDocument, options?: PlatformAdapter.Options) {
    if (this._api)
      throw new Error(`Already initialized`);
    this._api = api;
    this._interceptors = [...(options?.interceptors || [])];
    this._logger = options?.logger && options.logger instanceof Logger
        ? options.logger
        : new Logger({instance: options?.logger})
    // Assign events
    if (options?.on) {
      for (const [event, fn] of Object.entries(options.on)) {
        /* istanbul ignore next */
        if (typeof fn === 'function')
          this.on(event, fn);
      }
    }
    // Make a safe service name
    this._serviceName = pascalCase((api.info.title || '').replace(/[^a-z0-9_ ]/ig, '')) || 'OpraService';
    if (!/^[a-z]/i.test(this._serviceName))
      this._serviceName = 'X' + this._serviceName;

    // Init I18n
    if (options?.i18n instanceof I18n)
      this._i18n = options.i18n;
    else if (typeof options?.i18n === 'function')
      this._i18n = await options.i18n();
    else this._i18n = await this._createI18n(options?.i18n);
    this._i18n = this._i18n || I18n.defaultInstance;
    if (!this._i18n.isInitialized)
      await this._i18n.init();

    // Initialize all resources
    await this.getController(this.api.root);
  }

  async getController(resource: Resource | string): Promise<any> {
    resource = typeof resource === 'object' && resource instanceof Resource
        ? resource : this.api.getResource(resource);
    let controller = this._controllers.get(resource);
    if (!controller) {
      controller = resource.controller;
      if (!controller && resource.ctor) {
        controller = new resource.ctor();
      }
      this._controllers.set(resource, controller);
    }
    if (controller && !controller[resourceInitialized]) {
      controller[resourceInitialized] = true;
      // Initialize controller
      if (typeof controller.onInit === 'function')
        await controller.onInit.call(controller);
      // Initialize sub resources of Container
      if (resource instanceof Container) {
        for (const r of resource.resources.values()) {
          await this.getController(r);
        }
      }
    }
    return controller;
  }

  async getOperationHandler(
      resource: Resource | string,
      operationOrAction: string
  ): Promise<{
    endpoint: Endpoint;
    controller: any;
    handler: Function;
  }> {
    resource = typeof resource === 'object' && resource instanceof Resource
        ? resource
        : this.api.getResource(resource);
    const controller = await this.getController(resource);
    const endpoint =
        (resource instanceof CrudResource && resource.operations.get(operationOrAction)) ||
        resource.actions.get(operationOrAction);
    if (endpoint) {
      const handler = typeof controller[operationOrAction] === 'function' ? controller[operationOrAction] : undefined;
      if (handler)
        return {controller, endpoint, handler};
    }
    throw new ForbiddenError({
      message: translate('OPERATION_FORBIDDEN', {resource: resource.name, endpoint: operationOrAction},
          `'{{resource}}' does not accept '{{endpoint}}' operations`),
      severity: 'error',
      code: 'OPERATION_FORBIDDEN'
    });
  }

  protected async _createI18n(options?: PlatformAdapter.I18nOptions): Promise<I18n> {
    const opts: PlatformAdapter.I18nOptions = {
      ...options,
    }
    delete opts.resourceDirs;
    const instance = I18n.createInstance(opts);
    await instance.init();
    await instance.loadResourceDir(path.resolve(getStackFileName(), '../../../i18n'));
    if (options?.resourceDirs)
      for (const dir of options.resourceDirs)
        await instance.loadResourceDir(dir);
    return instance;
  }

  abstract handleExecution(executionContext: ExecutionContext): Promise<void>;

}
