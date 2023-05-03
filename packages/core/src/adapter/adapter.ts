import path from 'path';
import { AsyncEventEmitter } from 'strict-typed-events';
import {
  ApiDocument,
  Collection,
  DocumentFactory,
  FallbackLng,
  ForbiddenError,
  getStackFileName,
  I18n, LanguageResource,
  OpraSchema,
  ResourceNotFoundError,
  Singleton,
  translate,
} from '@opra/common';
import { ILogger } from './interfaces/logger.interface.js';
import { RequestContext } from './interfaces/request-context.interface.js';
import { MetadataResource } from './internal/metadata.resource.js';

/**
 * @namespace OpraAdapter
 */
export namespace OpraAdapter {

  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    logger?: ILogger;
    onRequest?: (ctx: RequestContext) => void | Promise<void>;
  }

  export interface I18nOptions {
    /**
     * Language to use
     * @default undefined
     */
    lng?: string;

    /**
     * Language to use if translations in user language are not available.
     * @default 'dev'
     */
    fallbackLng?: false | FallbackLng;

    /**
     * Default namespace used if not passed to translation function
     * @default 'translation'
     */
    defaultNS?: string;

    /**
     * Resources to initialize with
     * @default undefined
     */
    resources?: LanguageResource;

    /**
     * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
     * @default undefined
     */
    resourceDirs?: string[];
  }


}

/**
 * @class OpraAdapter
 */
export abstract class OpraAdapter extends AsyncEventEmitter {
  protected _internalDoc: ApiDocument;
  i18n: I18n;
  logger?: ILogger;

  protected constructor(readonly api: ApiDocument) {
    super();
  }

  /**
   * Initializes the adapter
   * @param options
   * @protected
   */
  protected async init(options?: OpraAdapter.Options) {
    this.logger = options?.logger;
    if (options?.i18n instanceof I18n)
      this.i18n = options.i18n;
    else if (typeof options?.i18n === 'function')
      this.i18n = await options.i18n();
    else this.i18n = await this._createI18n(options?.i18n);
    this.i18n = this.i18n || I18n.defaultInstance;
    if (!this.i18n.isInitialized)
      await this.i18n.init();
    if (options?.onRequest)
      this.on('request', options.onRequest);

    this._internalDoc = await DocumentFactory.createDocument({
      version: OpraSchema.SpecVersion,
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Internal resources',
      },
      references: {'api': this.api},
      resources: [new MetadataResource(this.api)]
    });

    const promises: Promise<void>[] = [];
    for (const r of this.api.resources.values()) {
      const onInit = r.onInit;
      if (onInit)
        promises.push((async () => onInit.call(r.controller, r))());
    }
    await Promise.all(promises);
  }

  /**
   * Calls shutDown hook for all resources
   */
  async close() {
    const promises: Promise<void>[] = [];
    for (const r of this.api.resources.values()) {
      const onShutdown = r.onShutdown;
      if (onShutdown)
        promises.push((async () => onShutdown.call(r.controller, r))());
    }
    await Promise.allSettled(promises);
  }

  protected async executeRequest(context: RequestContext): Promise<void> {
    await this.emitAsync('request', context);
    const {request, response} = context;
    const {resource, operation} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const endpoint = resource.operations[operation] as OpraSchema.Endpoint;
      if (!endpoint?.handler)
        throw new ForbiddenError({
          message: translate('RESOLVER_FORBIDDEN', {operation},
              `The resource endpoint does not accept '{{operation}}' operations`),
          severity: 'error',
          code: 'RESOLVER_FORBIDDEN'
        });
      const value = await endpoint.handler(context);
      // if (value == null)
      if (value != null)
        response.value = value;

      const {crud, many} = request;
      if (crud === 'delete' || (crud === 'update' && many)) {
        let affected = 0;
        if (typeof response.value === 'number')
          affected = response.value;
        if (typeof response.value === 'boolean')
          affected = response.value ? 1 : 0;
        if (typeof response.value === 'object')
          affected = response.value.affectedRows || response.value.affected;
        response.value = {
          operation: request.operation,
          affected
        }
      } else if (response.value != null) {
        if (!request.many)
          response.value = Array.isArray(response.value) ? response.value[0] : response.value;
        else response.value = Array.isArray(response.value) ? response.value : [response.value];
      }
      if ((request.operation === 'get' || request.operation === 'update') && response.value == null)
        throw new ResourceNotFoundError(resource.name, request.args.key);
    }
  }

  protected async _createI18n(options?: OpraAdapter.I18nOptions): Promise<I18n> {
    const opts: OpraAdapter.I18nOptions = {
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

}

