import { Inject, Logger } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module.js';
import { ApiDocument, OpraURLPath } from '@opra/common';
import { ILogger, OpraAdapter, OpraExpressAdapter } from '@opra/core';
import { OPRA_MODULE_OPTIONS } from '../constants.js';
import { OpraApiFactory } from '../factories/opra-api.factory.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';

export class OpraApiLoader {
  private readonly logger = new Logger(OpraApiLoader.name, {timestamp: true});
  private adapter: OpraAdapter | undefined;

  @Inject()
  protected readonly httpAdapterHost: HttpAdapterHost;

  @Inject()
  protected readonly applicationConfig: ApplicationConfig;

  @Inject()
  protected readonly opraFactory: OpraApiFactory;

  @Inject(OPRA_MODULE_OPTIONS)
  protected readonly opraModuleOptions: OpraModuleOptions;

  async initialize(rootModule: Module) {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;
    const globalPrefix = this.applicationConfig.getGlobalPrefix();
    const platformName = httpAdapter.getType();
    const moduleOptions = this.opraModuleOptions;

    let prefixPath = new OpraURLPath((moduleOptions.useGlobalPrefix !== false ? globalPrefix : ''));
    if (moduleOptions.basePath)
      prefixPath = prefixPath.join(moduleOptions.basePath);
    const name = moduleOptions.info?.title || 'untitled service';

    const options: OpraModuleOptions = {
      ...moduleOptions,
      basePath: prefixPath.toString()
    }

    try {
      const serviceHost = await this.opraFactory.generateService(rootModule, options, 'http');
      if (!serviceHost.resources.size) {
        this.logger.warn(`No resources found (${name})`);
        return;
      }

      if (platformName === 'express') {
        this.adapter = await this.registerExpress(serviceHost, options);
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

  protected async registerExpress(service: ApiDocument, moduleOptions: OpraModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter)
      return;
    const app = httpAdapter.getInstance();
    let logger = moduleOptions.logger;
    if (!logger) {
      logger = new Logger(service.info.title) as unknown as ILogger;
      logger.fatal = logger.error.bind(logger);
    }
    return OpraExpressAdapter.create(app, service, {
      logger,
      ...moduleOptions
    });
  }

}
