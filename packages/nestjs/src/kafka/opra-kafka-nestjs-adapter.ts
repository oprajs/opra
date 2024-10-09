import { ModuleRef, NestContainer } from '@nestjs/core';
import { RuntimeException } from '@nestjs/core/errors/exceptions/index';
import { ApiDocument, ApiDocumentFactory, RPC_CONTROLLER_METADATA } from '@opra/common';
import { KafkaAdapter } from '@opra/kafka';
import { BaseNestAdapter } from '../base-nestjs-adapter.js';
import type { OpraKafkaModule } from './opra-kafka.module.js';

/**
 * @class
 */
export class OpraKafkaNestjsAdapter extends BaseNestAdapter {
  private _adapter?: KafkaAdapter;
  private _document?: ApiDocument;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
  }

  get document(): ApiDocument {
    if (!this._document) throw new RuntimeException('Not initialized yet');
    return this._document;
  }

  get adapter(): KafkaAdapter {
    if (!this._adapter) throw new RuntimeException('Not initialized yet');
    return this._adapter;
  }

  async start() {
    if (!this._adapter) {
      throw new RuntimeException('Not initialized yet');
    }
    return this._adapter.start();
  }

  async stop() {
    return this._adapter?.close();
  }

  async initialize(init: OpraKafkaModule.ApiConfig) {
    const controllers = this._scanControllers();
    this._document = await ApiDocumentFactory.createDocument({
      info: init.info,
      types: init.types,
      references: init.references,
      api: {
        name: init.name,
        description: init.description,
        transport: 'rpc',
        platform: 'kafka',
        controllers,
      },
    });

    this._adapter = new KafkaAdapter({
      client: init.client,
      logger: init.logger,
      logExtra: init.logExtra,
      consumers: init.consumers,
      document: this._document,
    });
  }

  protected _scanControllers() {
    const container = (this.moduleRef as any).container as NestContainer;
    const modules = container.getModules();
    const out: any[] = [];
    modules.forEach(({ controllers }) => {
      controllers.forEach(wrapper => {
        const ctor = Object.getPrototypeOf(wrapper.instance).constructor;
        const metadata = Reflect.getMetadata(RPC_CONTROLLER_METADATA, ctor);
        if (!metadata) return;
        const instance = {};
        Object.setPrototypeOf(instance, wrapper.instance);
        out.push(wrapper.instance);
        // if (metadata.operations) {
        //   for (const [k, _] of Object.keys(metadata.operations)) {
        //     const isRequestScoped = !wrapper.isDependencyTreeStatic();
        //     //   const fn = instance[k];
        //     //   instance[k] = fn;
        //   }
        // }
      });
    });
    return out;
  }
}
