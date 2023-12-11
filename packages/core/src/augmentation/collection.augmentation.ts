import { StrictOmit } from 'ts-gems';
import type { Action as _Action, CrudOperation as _Operation, PartialDTO } from '@opra/common';
import type { Request as _Request } from '../request.js';
import type { RequestContext } from '../request-context';

declare module "@opra/common" {

  /* ***************************** */
  namespace Collection {

    namespace Action {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Action;
        params: {
          [key: string]: any;
        }
      }

      interface Context extends Resource.Context {
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
        key: any;
        params: {
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace DeleteMany {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'deleteMany' };
        params: {
          filter?: any;
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace FindMany {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'findMany' };
        params: {
          filter?: any;
          pick?: string[];
          omit?: string[];
          include?: string[];
          sort?: string[];
          limit?: number;
          skip?: number;
          distinct?: boolean;
          count?: boolean;
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }

    /* ***************************** */
    namespace Get {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'get' };
        key: any;
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
        key: any;
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
    namespace UpdateMany {
      interface Request extends StrictOmit<_Request, 'endpoint'> {
        endpoint: _Operation & { name: 'updateMany' };
        data: any;
        params: {
          filter?: any;
          [key: string]: any;
        }
      }

      interface Context extends RequestContext {
        request: Request;
      }
    }
  }

  /* ***************************** */
  export interface ICollection<T> {
    create?(context: Collection.Create.Context): Promise<PartialDTO<T>>;

    delete?(context: Collection.Delete.Context): Promise<number> | undefined;

    deleteMany?(context: Collection.DeleteMany.Context): Promise<number> | undefined;

    findMany?(context: Collection.FindMany.Context): Promise<PartialDTO<T>[] | undefined>;

    get?(context: Collection.Get.Context): Promise<PartialDTO<T> | undefined>;

    update?(context: Collection.Update.Context): Promise<PartialDTO<T> | undefined>;

    updateMany?(context: Collection.UpdateMany.Context): Promise<number> | undefined;

    onInit?(): Promise<void>;

    onShutdown?(): Promise<void>;
  }

}
