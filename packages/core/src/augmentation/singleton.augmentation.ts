import type { PartialOutput } from '@opra/common';
import type { OperationContext } from '../adapter/operation-context.js';
import type { Request as _Request } from '../adapter/request.js';

declare module "@opra/common" {

  /* ***************************** */
  namespace Singleton {

    /* ***************************** */
    namespace Create {
      interface Request extends _Request {
        operation: 'create';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends OperationContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Delete {
      interface Request extends _Request {
        operation: 'delete';
      }

      interface Context extends OperationContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends _Request {
        operation: 'get';
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends OperationContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Update {
      interface Request extends _Request {
        operation: 'update';
        data: any;
        params: {
          pick?: string[];
          omit?: string[];
          include?: string[];
        }
      }

      interface Context extends OperationContext {
        request: Request;
      }
    }

  }

  /* ***************************** */
  export interface SingletonResource<T> {
    create?(context: Singleton.Create.Context): Promise<PartialOutput<T>>;

    delete?(context: Singleton.Delete.Context): Promise<number> | undefined;

    get?(context: Singleton.Get.Context): Promise<PartialOutput<T> | undefined>;

    update?(context: Singleton.Update.Context): Promise<PartialOutput<T> | undefined>;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }
}
