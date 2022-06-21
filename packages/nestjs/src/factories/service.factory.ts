import {Injectable} from '@nestjs/common';
import {Module} from '@nestjs/core/injector/module.js';
import {OpraServiceHost} from '@opra/common';
import {OpraModuleOptions} from '../interfaces/opra-module-options.interface.js';
import {ExplorerService} from '../services/explorer.service.js';

@Injectable()
export class ServiceFactory {
  constructor(
    private readonly explorerService: ExplorerService,
  ) {
  }

  generateServiceHost(rootModule: Module, moduleOptions: OpraModuleOptions): OpraServiceHost {
    const serviceHost = new OpraServiceHost({
      name: moduleOptions.name,
      description: moduleOptions.description,
      prefix: moduleOptions.prefix
    });
    this.explorerService.addResourcesToOpraService(rootModule, serviceHost);
    return serviceHost;
  }

}
