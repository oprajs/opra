import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { OpraSchema, RESOURCE_METADATA } from '@opra/common';

type WrapperCallback = (wrapper: InstanceWrapper, tree: Module[]) => void;

export class NestExplorer {

  exploreProviders(rootModule: Module, callback: WrapperCallback): void {
    const modules = new Set<Module>();
    const tree: Module[] = [];
    const scanModules = (m: Module) => {
      if (modules.has(m))
        return;
      modules.add(m);
      tree.push(m);
      for (const mm of m.imports.values()) {
        scanModules(mm);
      }
      for (const wrapper of m.providers.values()) {
        callback(wrapper, tree);
        if (wrapper.host)
          scanModules(wrapper.host);
      }
      tree.pop();
    }
    scanModules(rootModule);
  }

  exploreResources(rootModule: Module, callback: WrapperCallback): void {
    this.exploreProviders(rootModule, (wrapper: InstanceWrapper, tree) => {
      if (wrapper.instance
          && typeof wrapper.instance === 'object'
          && wrapper.instance.constructor
          && OpraSchema.isResource(Reflect.getMetadata(RESOURCE_METADATA, wrapper.instance.constructor))) {
        callback(wrapper, tree);
      }
      return false;
    })
  }

}

