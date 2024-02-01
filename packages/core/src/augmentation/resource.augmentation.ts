import type { Mutable } from 'ts-gems';
import { ApiResource, Collection, RESOURCE_METADATA, Singleton } from "@opra/common";
import { RequestContext } from '../request-context.js';

declare module "@opra/common" {
  interface CollectionConstructor {
    OnInit();

    OnShutdown();
  }

  interface SingletonConstructor {
    OnInit();

    OnShutdown();
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace ApiResource {
    interface Context extends RequestContext {
      params: Record<string, any>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface ApiResource {
    onInit?: (resource: ApiResource) => void | Promise<void>;
    onShutdown?: (resource: ApiResource) => void | Promise<void>;
  }

  namespace ApiResource {
    interface InitArguments {
      onInit?: (resource: ApiResource) => void | Promise<void>;
      onShutdown?: (resource: ApiResource) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Collection {
    interface Metadata {
      onInit?: (resource: Collection) => void | Promise<void>;
      onShutdown?: (resource: Collection) => void | Promise<void>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace Singleton {
    interface Metadata {
      onInit?: (resource: Singleton) => void | Promise<void>;
      onShutdown?: (resource: Singleton) => void | Promise<void>;
    }
  }
}

// @ts-ignore
const oldConstruct = ApiResource.prototype._construct;
// @ts-ignore
ApiResource.prototype._construct = function (init: ApiResource.InitArguments) {
  oldConstruct.call(this, init);
  const _this = this as Mutable<ApiResource>;
  _this.onInit = init.onInit;
  _this.onShutdown = init.onShutdown;
}

Collection.OnInit = Singleton.OnInit = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(RESOURCE_METADATA, target.constructor, sourceMetadata);
  }
}

Collection.OnShutdown = Singleton.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol): void => {
    const sourceMetadata = (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(RESOURCE_METADATA, target.constructor, sourceMetadata);
  }
}
