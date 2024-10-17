import { ModuleRef, NestContainer } from '@nestjs/core';
import { ApiDocumentFactory, RPC_CONTROLLER_METADATA } from '@opra/common';
import { KafkaAdapter } from '@opra/kafka';
import type { OpraKafkaModule } from '../opra-kafka.module.js';

export async function initializeAdapter(
  moduleRef: ModuleRef,
  adapter: KafkaAdapter,
  config: OpraKafkaModule.ApiConfig,
) {
  const controllers = scanControllers(moduleRef);
  const document = await ApiDocumentFactory.createDocument({
    info: config.info,
    types: config.types,
    references: config.references,
    api: {
      name: config.name,
      description: config.description,
      transport: 'rpc',
      platform: 'kafka',
      controllers,
    },
  });
  await adapter.initialize(document);
}

function scanControllers(moduleRef: ModuleRef) {
  const container = (moduleRef as any).container as NestContainer;
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
