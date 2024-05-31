import { ApiDocument } from '@opra/common';
import { PlatformAdapter } from '@opra/core';
import { kAdapter, kOptions } from './constants.js';
import { OpraModuleOptions } from './interfaces/opra-module-options.interface.js';

export class OpraModuleRef {
  protected [kOptions]: OpraModuleOptions;
  protected [kAdapter]: PlatformAdapter;

  get adapter(): PlatformAdapter {
    return this[kAdapter];
  }

  get api(): ApiDocument {
    return this[kAdapter].document;
  }

  get options(): OpraModuleOptions {
    return this[kOptions];
  }
}
