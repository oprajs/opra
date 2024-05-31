import '../../augmentation/18n.augmentation.js';
import path from 'path';
import { AsyncEventEmitter } from 'strict-typed-events';
import { ApiDocument, getStackFileName, I18n, OpraSchema } from '@opra/common';
import { Logger } from '../../helpers/logger.js';
import type { PlatformAdapter } from './interfaces/platform-adapter.interface';

const initializedSymbol = Symbol('initialized');

/**
 * @class PlatformAdapterHost
 */
export abstract class PlatformAdapterHost extends AsyncEventEmitter implements PlatformAdapter {
  protected [initializedSymbol] = false;
  protected _document: ApiDocument;
  protected _protocol: OpraSchema.Protocol;
  protected _platform: string;
  protected _i18n: I18n;
  protected _logger: Logger;

  get document(): ApiDocument {
    return this._document;
  }

  get platform(): string {
    return this._platform;
  }

  get protocol(): OpraSchema.Protocol {
    return this._protocol;
  }

  get apiName(): string {
    return this.document.api!.name;
  }

  get i18n(): I18n {
    return this._i18n;
  }

  async close() {
    await this._close();
  }

  async init(api: ApiDocument, options?: PlatformAdapter.Options) {
    if (this[initializedSymbol]) throw new Error(`Already initialized`);
    await this._init(api, options);
    this[initializedSymbol] = true;
  }

  protected async _close() {}

  /**
   * Initializes the adapter
   */
  protected async _init(document: ApiDocument, options?: PlatformAdapter.Options) {
    this._document = document;
    this._logger =
      options?.logger && options.logger instanceof Logger ? options.logger : new Logger({ instance: options?.logger });
    // Init I18n
    if (options?.i18n instanceof I18n) this._i18n = options.i18n;
    else if (typeof options?.i18n === 'function') this._i18n = await options.i18n();
    else this._i18n = await this._createI18n(options?.i18n);
    this._i18n = this._i18n || I18n.defaultInstance;
    if (!this._i18n.isInitialized) await this._i18n.init();
  }

  // async getActionHandler(resource: ApiResource | string, name: string): Promise<{
  //   endpoint: ApiAction;
  //   controller: any;
  //   handler: Function;
  // }> {
  //   resource = typeof resource === 'object' && resource instanceof ApiResource
  //       ? resource
  //       : this.api.getResource(resource);
  //   const controller = await this.getController(resource);
  //   const endpoint = resource.actions.get(name);
  //   if (endpoint) {
  //     const handler = typeof controller[endpoint.name] === 'function' ? controller[endpoint.name] : undefined;
  //     if (handler)
  //       return {controller, endpoint, handler};
  //   }
  //   throw new BadRequestError({
  //     message: translate('error:ACTION_NOT_FOUND', {resource: resource.name, action: name}),
  //     severity: 'error',
  //     code: 'ACTION_NOT_FOUND'
  //   });
  // }
  //
  // async getOperationHandler(
  //     resource: ApiResource | string,
  //     name: string
  // ): Promise<{
  //   endpoint: ApiOperation;
  //   controller: any;
  //   handler: Function;
  // }> {
  //   resource = typeof resource === 'object' && resource instanceof ApiResource
  //       ? resource
  //       : this.api.getResource(resource);
  //   const controller = await this.getController(resource);
  //   const endpoint = resource instanceof CrudResource && resource.operations.get(name);
  //   if (endpoint) {
  //     const handler = typeof controller[endpoint.name] === 'function' ? controller[endpoint.name] : undefined;
  //     if (handler)
  //       return {controller, endpoint, handler};
  //   }
  //   throw new ForbiddenError({
  //     message: translate('error:OPERATION_FORBIDDEN', {resource: resource.name, operation: name}),
  //     severity: 'error',
  //     code: 'OPERATION_FORBIDDEN'
  //   });
  // }

  protected async _createI18n(options?: PlatformAdapter.I18nOptions): Promise<I18n> {
    const opts: PlatformAdapter.I18nOptions = {
      ...options,
    };
    delete opts.resourceDirs;
    const instance = I18n.createInstance(opts);
    await instance.init();
    await instance.loadResourceDir(path.resolve(getStackFileName(), '../../../i18n'));
    if (options?.resourceDirs) for (const dir of options.resourceDirs) await instance.loadResourceDir(dir);
    return instance;
  }
}
