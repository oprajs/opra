import { Inject } from '@nestjs/common';
import { MetadataScanner, } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { API_RESOURCE_METADATA } from '@opra/core';

export class ExplorerService {

  @Inject()
  protected readonly metadataScanner: MetadataScanner;

  exploreProviders(rootModule: Module, predicate: (wrapper: InstanceWrapper) => boolean) {
    const wrappers: InstanceWrapper[] = [];
    this._deepScan(rootModule, (m: Module) => {
      for (const wrapper of m.providers.values()) {
        if (predicate(wrapper))
          wrappers.push(wrapper);
      }
    });
    return wrappers;
  }

  exploreResourceWrappers(rootModule: Module): InstanceWrapper[] {
    return this.exploreProviders(rootModule, (wrapper: InstanceWrapper) => {
      return !!(wrapper.instance
          && typeof wrapper.instance === 'object'
          && wrapper.instance.constructor
          && Reflect.hasMetadata(API_RESOURCE_METADATA, wrapper.instance.constructor))
    })
  }

  protected _deepScan(module: Module, callback: (module: Module) => void) {
    for (const m of module.imports) {
      callback(m);
      this._deepScan(m, callback);
    }
  }


}

