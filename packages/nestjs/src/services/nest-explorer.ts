import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { RESOURCE_METADATA } from '@opra/common';

export class NestExplorer {

  exploreProviders(rootModule: Module, predicate: (wrapper: InstanceWrapper) => boolean) {
    const modules = new Set<Module>();
    const wrappers = new Set<InstanceWrapper>();
    const scanModules = (m: Module) => {
      if (modules.has(m))
        return;
      modules.add(m);
      for (const mm of m.imports.values()) {
        scanModules(mm);
      }
      for (const wrapper of m.providers.values()) {
        if (!wrappers.has(wrapper) && predicate(wrapper))
          wrappers.add(wrapper);
        if (wrapper.host)
          scanModules(wrapper.host);
      }
    }
    scanModules(rootModule);
    return Array.from(wrappers.values());
  }

  exploreResourceWrappers(rootModule: Module): InstanceWrapper[] {
    return this.exploreProviders(rootModule, (wrapper: InstanceWrapper) => {
      return !!(wrapper.instance
          && typeof wrapper.instance === 'object'
          && wrapper.instance.constructor
          && Reflect.hasMetadata(RESOURCE_METADATA, wrapper.instance.constructor))
    })
  }

}

