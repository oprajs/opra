import { StrictOmit } from 'ts-gems';
import { ApiAction as _Action, ApiOperation as _Operation, PartialDTO } from '@opra/common';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Singleton {

    namespace Action {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Action;
      }

      interface Context extends ApiResource.Context {
      }
    }

    /* ***************************** */
    namespace Create {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'create' };
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'delete' };
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'get' };
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'update' };
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

  }

  /* ***************************** */
  export interface ISingleton<T> {
    create?(context: Singleton.Create.Context): Promise<PartialDTO<T>>;

    delete?(context: Singleton.Delete.Context): Promise<number> | undefined;

    get?(context: Singleton.Get.Context): Promise<PartialDTO<T> | undefined>;

    update?(context: Singleton.Update.Context): Promise<PartialDTO<T> | undefined>;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }
}
