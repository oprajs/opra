import path from 'path';
import { pascalCase } from 'putil-varhelpers';
import { AsyncEventEmitter } from 'strict-typed-events';
import { Type } from 'ts-gems';
import { ApiDocument, getStackFileName, I18n, Resource } from '@opra/common';
import { ExecutionContext } from './execution-context.js';
import { Interceptor } from './interfaces/interceptor.interface.js';
import type { PlatformAdapter, Protocol } from './platform-adapter.js';
import { Logger } from './services/logger.js';

/**
 * @class PlatformAdapterHost
 */
export abstract class PlatformAdapterHost extends AsyncEventEmitter implements PlatformAdapter {
  _controllers = new WeakMap<Resource, any>();
  _protocol: Protocol;
  _platform: string;
  _initialized = false;
  _serviceName: string;
  _options: PlatformAdapter.Options;
  _i18n: I18n;
  _logger: Logger;
  _interceptors: Interceptor[];

  protected constructor(readonly api: ApiDocument, options?: PlatformAdapter.Options) {
    super();
    this._options = options || {};
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
  }

  get platform(): string {
    return this._platform;
  }

  get protocol(): Protocol {
    return this._protocol;
  }

  get serviceName(): string {
    return this.api.info.title;
  }

  async close() {
    const promises: Promise<void>[] = [];
    for (const r of this.api.resources.values()) {
      const onShutdown = r.onShutdown;
      if (onShutdown)
        promises.push((async () => onShutdown.call(r.controller, r))());
    }
    await Promise.allSettled(promises);
  }

  /**
   * Initializes the adapter
   */
  async init() {
    if (this._initialized)
      return;

    // Init I18n
    if (this._options?.i18n instanceof I18n)
      this._i18n = this._options.i18n;
    else if (typeof this._options?.i18n === 'function')
      this._i18n = await this._options.i18n();
    else this._i18n = await this._createI18n(this._options?.i18n);
    this._i18n = this._i18n || I18n.defaultInstance;
    if (!this._i18n.isInitialized)
      await this._i18n.init();

    // Initialize all resources
    for (const resource of this.api.resources.values()) {
      await this.getController(resource);
    }
    this._initialized = true;
  }

  async getController(resource: Resource | string): Promise<any> {
    resource = typeof resource === 'object' && resource instanceof Resource
        ? resource : this.api.getResource(resource);
    let controller = this._controllers.get(resource);
    if (!controller) {
      if (resource.controller) {
        controller = typeof resource.controller === 'function' ?
            new (resource.controller as Type)()
            : resource.controller;
        // Initialize controller
        if (typeof controller.onInit === 'function')
          await controller.onInit.call(controller)
        this._controllers.set(resource, controller);
      }
    }
    return controller;
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

  abstract processRequest(executionContext: ExecutionContext): Promise<void>;

}
