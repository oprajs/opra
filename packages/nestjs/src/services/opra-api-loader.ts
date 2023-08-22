import { Inject, Logger } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module.js';
import { ApiDocument, OpraURLPath } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import { kAdapter, kOptions, OPRA_MODULE_OPTIONS } from '../constants.js';
import { OpraApiFactory } from '../factories/opra-api.factory.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';
import { OpraModuleRef } from '../opra-module-ref.js';

export class OpraApiLoader {
  protected readonly logger = new Logger(OpraApiLoader.name, {timestamp: true});
  readonly opraModuleRef = new OpraModuleRef();

  @Inject()
  protected readonly httpAdapterHost: HttpAdapterHost;

  @Inject()
  protected readonly applicationConfig: ApplicationConfig;

  @Inject()
  protected readonly opraFactory: OpraApiFactory;

  @Inject(OPRA_MODULE_OPTIONS)
  protected readonly options: OpraModuleOptions;

  async initialize(rootModule: Module) {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;
    const globalPrefix = this.applicationConfig.getGlobalPrefix();
    const platformName = httpAdapter.getType();
    const moduleOptions = this.options;

    this.opraModuleRef[kOptions] = this.options;

    let prefixPath = new OpraURLPath((moduleOptions.useGlobalPrefix !== false ? globalPrefix : ''));
    if (moduleOptions.basePath)
      prefixPath = prefixPath.join(moduleOptions.basePath);
    const name = moduleOptions.info?.title || 'untitled service';

    const options: OpraModuleOptions = {
      ...moduleOptions,
      basePath: prefixPath.toString()
    }

    try {
      const apiDocument = await this.opraFactory.generateService(rootModule, options, 'http');
      if (!apiDocument.resources.size) {
        this.logger.warn(`No Sources found (${name})`);
        return;
      }

      if (platformName === 'express') {
        this.opraModuleRef[kAdapter] = await this.registerExpress(apiDocument, options);
        // else if (platformName === 'fastify')
        // await this.registerFastify();
      } else { // noinspection ExceptionCaughtLocallyJS
        throw new Error(`No support for current HttpAdapter: ${platformName}`);
      }

      this.logger.log(`Mapped {${prefixPath.toString() || '/'}} to "${name}" service`);

    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async stop() {
    //
  }

  protected async registerExpress(apiDocument: ApiDocument, moduleOptions: OpraModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    /* istanbul ignore next */
    if (!httpAdapter)
      throw new Error('HttpAdapterHost is not initialized');
    const app = httpAdapter.getInstance();
    const logger = moduleOptions.logger || new Logger(apiDocument.info.title);
    return await ExpressAdapter.create(app, apiDocument, {
      ...moduleOptions,
      logger,
    });
  }

}
