export * from './constants';
export * from './common/request';

export * from './decorators/api/controller.decorator';
export * from './decorators/api/list.decorator';
export * from './decorators/api/request.decorator';

export * from './module/opra.interface';
export * from './module/opra.module';

import * as _Api from './decorators/api';

export namespace Opra {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Api = _Api;
}
