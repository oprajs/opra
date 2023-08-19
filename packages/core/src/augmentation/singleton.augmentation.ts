import type { PartialOutput } from '@opra/common';
import type { EndpointContext } from '../adapter/endpoint-context.js';
import type { Request as _Request } from '../adapter/request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Singleton {

    /* ***************************** */
    namespace Create {
      interface Request extends _Request {
        endpoint: 'create';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        endpoint: 'delete';
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        endpoint: 'get';
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends _Request {
        endpoint: 'update';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends EndpointContext {
        request: Request;
      }
    }

  }

  /* ***************************** */
  export interface ISingleton<T> {
    create?(context: Singleton.Create.Context): Promise<PartialOutput<T>>;

    delete?(context: Singleton.Delete.Context): Promise<number> | undefined;

    get?(context: Singleton.Get.Context): Promise<PartialOutput<T> | undefined>;

    update?(context: Singleton.Update.Context): Promise<PartialOutput<T> | undefined>;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }
}
