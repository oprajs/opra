import { PlatformAdapter } from '../../base/interfaces/platform-adapter.interface.js';
import { HttpContext } from './http-context.interface.js';

export interface HttpAdapter extends PlatformAdapter {
  getControllerInstance<T>(controllerPath: string): T | undefined;
}

export namespace HttpAdapter {
  export type Interceptor = (context: HttpContext, next: () => Promise<void>) => Promise<void>;

  export interface Options extends PlatformAdapter.Options {
    interceptors?: Interceptor[];
    onRequest?: (ctx: HttpContext) => void | Promise<void>;
  }
}
