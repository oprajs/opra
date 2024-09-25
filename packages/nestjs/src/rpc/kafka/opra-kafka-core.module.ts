import {
  type DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OPRA_KAFKA_MODULE_OPTIONS } from '../../constants.js';
import type { OpraKafkaModule } from './opra-kafka.module.js';
import { OpraKafkaNestjsAdapter } from './opra-kafka-nestjs-adapter.js';

const opraKafkaNestjsAdapterToken = Symbol('OpraKafkaNestjsAdapter');

@Module({})
@Global()
export class OpraKafkaCoreModule implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(opraKafkaNestjsAdapterToken)
    protected adapter: OpraKafkaNestjsAdapter,
    @Inject(OPRA_KAFKA_MODULE_OPTIONS)
    protected init: OpraKafkaModule.Initiator,
  ) {}

  static forRoot(init: OpraKafkaModule.Initiator): DynamicModule {
    const adapterProvider = {
      provide: init.id || OpraKafkaNestjsAdapter,
      inject: [ModuleRef],
      useFactory: (moduleRef: ModuleRef) => new OpraKafkaNestjsAdapter(moduleRef),
    };

    const providers = [
      ...(init?.providers || []),
      {
        provide: OPRA_KAFKA_MODULE_OPTIONS,
        useValue: { ...init },
      },
      adapterProvider,
      {
        provide: opraKafkaNestjsAdapterToken,
        useExisting: adapterProvider.provide,
      },
    ];
    return {
      global: true,
      module: OpraKafkaCoreModule,
      controllers: init.controllers,
      providers,
      imports: [...(init?.imports || [])],
      exports: [...(init?.exports || []), adapterProvider],
    };
  }

  async onModuleInit() {
    await this.adapter.initialize(this.init);
  }

  async onApplicationBootstrap() {
    await this.adapter.start();
  }

  async onApplicationShutdown() {
    await this.adapter.stop();
  }
}
